import { tauriLocalStore } from "@/store/tauriStore";
import { fetch } from "@tauri-apps/plugin-http";
import { toast } from "sonner";
import { ApiResponse } from "@/types/api";
import { RefreshTokenResponse } from "@/types/api-responses";

// 基础配置
const BASE_URL = "http://localhost:3000/api"; // 替换你的后端地址

// 定义类似 Axios 的请求配置类型
interface HttpConfig extends RequestInit {
  params?: Record<string, string | number>; // 用于 GET 请求的查询参数 ?a=1&b=2
  // 新增：是否跳过 401 拦截（用于 refresh 请求本身，防止死循环）
  skipInterceptor?: boolean;
}

// 可选：更可控的错误类型（只在“真异常”时用）
class HttpError extends Error {
  status?: number;
  bodyText?: string;
  data?: unknown;
  constructor(message: string, init?: Partial<HttpError>) {
    super(message);
    Object.assign(this, init);
  }
}

class Http {
  // 🔒 刷新锁：防止多个请求同时触发刷新
  private isRefreshing = false;

  // ⏳ 请求队列：存储刷新期间失败的请求
  private requestsQueue: Array<(token: string) => void> = [];

  private async request<T>(
    endpoint: string,
    config: HttpConfig = {},
  ): Promise<ApiResponse<T>> {
    let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    // 1. 处理 params
    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const paramString = params.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    // 2. 动态获取最新的 Token (支持 await tauriLocalStore.get)
    const headers = new Headers(config.headers);

    // 注意：这里我们优先从 tauriLocalStore 读取，因为它是持久化的源头
    // 实际项目中建议在内存维护一个 cachedToken 变量以提高性能，这里简化直接读
    const token = await tauriLocalStore.get<string>("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // 3. 发起请求
    const response = await fetch(url, {
      ...config,
      headers,
    });

    // 4. 🎯 核心拦截逻辑：处理 401 过期
    if (response.status === 401 && !config.skipInterceptor) {
      console.log(`[HTTP] Token 过期，拦截请求: ${endpoint}`);

      // 如果正在刷新，则将当前请求挂起放入队列
      if (this.isRefreshing) {
        return new Promise<ApiResponse<T>>((resolve) => {
          this.requestsQueue.push(() => {
            // 队列里的请求重新执行时，不需要再次传 token，因为 request 内部会重新获取
            resolve(this.request<T>(endpoint, config));
          });
        });
      }

      // 如果没有在刷新，开启刷新状态
      this.isRefreshing = true;

      try {
        // 尝试刷新 Token
        const success = await this.doRefreshToken();

        if (success) {
          // 刷新成功：重试队列中的请求 + 重试当前请求
          this.processQueue();
          return this.request<T>(endpoint, config);
        } else {
          // 刷新失败（Refresh Token 也过期了）：登出
          await this.handleLogout();
          throw new Error("会话已过期，请重新登录");
        }
      } catch (e) {
        // 发生异常也登出
        await this.handleLogout();
        throw e;
      } finally {
        // 无论成功失败，释放锁
        this.isRefreshing = false;
      }
    }

    // 5) 统一解析 body（无论 ok 还是非 ok）
    const text = await response.text();
    if (!text) {
      // 有些接口 204/空体
      return {} as unknown as ApiResponse<T>;
    }

    // 尝试 parse JSON（优先当作 ApiResponse）
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // 非 JSON 的错误体：这里再决定是否 throw
      // 你也可以选择“包装成 ApiResponse”返回
      throw new HttpError(`Invalid JSON response (HTTP ${response.status})`, {
        status: response.status,
        bodyText: text,
      });
    }

    // 6) 如果后端符合 {code,msg,data} 规范：即使 400 也直接返回，让业务层读 msg
    // 这样你的前端就能 toast res.msg 了
    return parsed as ApiResponse<T>;
  }

  // --- 辅助方法 ---

  /**
   * 执行 Token 刷新逻辑
   */
  private async doRefreshToken(): Promise<boolean> {
    try {
      // 获取 Refresh Token (假设你登录时存了)
      const refreshToken = await tauriLocalStore.get<string>("refreshToken");

      if (!refreshToken) return false;

      // 🔥 注意：这里必须设置 skipInterceptor: true，防止死循环
      // 我们用 request 方法发请求，但如果是 axios 可以用纯 fetch
      const res = await this.post<RefreshTokenResponse>(
        "/auth/refresh",
        { refreshToken },
        { skipInterceptor: true },
      );

      console.log("[HTTP] Token 刷新成功");

      if (res.code === 0 && res.data) {
        // 根据你的业务码调整
        console.log("[HTTP] Token 刷新成功");
        await tauriLocalStore.set("token", res.data.accessToken);
        if (res.data.refreshToken) {
          await tauriLocalStore.set("refreshToken", res.data.refreshToken);
        }
        await tauriLocalStore.save();
        return true;
      }

      return false;
    } catch (error) {
      console.error("[HTTP] Token 刷新失败:", error);
      return false;
    }
  }

  /**
   * 处理队列中的等待请求
   */
  private processQueue() {
    this.requestsQueue.forEach((callback) => callback(""));
    this.requestsQueue = [];
  }

  /**
   * 彻底登出
   */
  private async handleLogout() {
    console.log("[HTTP] 强制登出");
    await tauriLocalStore.set("token", null);
    await tauriLocalStore.set("refreshToken", null);
    await tauriLocalStore.save();

    toast.error("登录已过期，请重新登录");

    // 强制跳转登录页
    window.location.href =
      "/auth/login?redirect=" + encodeURIComponent(window.location.href);
  }

  // --- API 暴露 ---

  public get<T>(url: string, config?: HttpConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  public post<T>(url: string, data?: any, config?: HttpConfig) {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public put<T>(url: string, data?: any, config?: HttpConfig) {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // DELETE 请求
  public delete<T>(url: string, config?: HttpConfig) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  // PATCH 请求
  public patch<T>(url: string, data?: any, config?: HttpConfig) {
    return this.request<T>(url, {
      ...config,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }
}

export const http = new Http();
