import { fetch } from "@tauri-apps/plugin-http";

// 基础配置
const BASE_URL = "http://localhost:3000/api"; // 替换你的后端地址

// 定义类似 Axios 的请求配置类型
interface HttpConfig extends RequestInit {
  params?: Record<string, string | number>; // 用于 GET 请求的查询参数 ?a=1&b=2
}

class Http {
  // 核心请求方法
  private async request<T>(
    endpoint: string,
    config: HttpConfig = {},
  ): Promise<T> {
    let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    // 1. 处理查询参数 (params) -> ?key=value
    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    // 2. 处理 Headers
    const headers = new Headers(config.headers);

    // 自动携带 Token
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // 如果没有手动设置 Content-Type，且不是 FormData (上传文件)，默认设置为 JSON
    if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // 3. 发起请求
    const response = await fetch(url, {
      ...config,
      headers,
    });

    // 4. 统一错误处理
    if (!response.ok) {
      // 处理 401 未登录
      if (response.status === 401) {
        // 这里可以做一些清理工作，或者抛出特定错误让上层捕获跳转
        // localStorage.removeItem("token");
      }

      const errorBody = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorBody}`);
    }

    // 5. 返回 JSON 数据
    // 如果后端返回空（比如 204 No Content），这里可能会报错，需要根据实际情况调整
    return response.json();
  }

  // --- 暴露出的类似 Axios 的 API ---

  // GET 请求
  public get<T>(url: string, config?: HttpConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  // POST 请求 (自动处理 data 为 JSON)
  public post<T>(url: string, data?: any, config?: HttpConfig) {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // PUT 请求
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

// 导出单例对象
export const http = new Http();
