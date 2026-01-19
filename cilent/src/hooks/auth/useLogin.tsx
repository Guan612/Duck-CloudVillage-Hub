import { loginApi } from "@/http/auth";
import { refreshTokenAtom, tokenAtom, userInfoAtom } from "@/store/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// ✅ 1. 将 Schema 提取到 Hook 外部并导出
// 这样 Route 定义时可以直接引用 loginSearchSchema
export const loginSchema = z.object({
  loginId: z.string().min(1, "请输入用户名/手机号").max(20, "用户名过长"),
  password: z.string().min(6, "密码至少需要6位"),
});

export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

// 定义 Hook 的 Props，接收搜索参数
interface UseLoginProps {
  redirect?: string;
}

export default function useLogin({ redirect }: UseLoginProps) {
  const setToken = useSetAtom(tokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setUserInfo = useSetAtom(userInfoAtom);
  const router = useRouter();
  const navigate = useNavigate();

  // 2. 初始化 Form 实例
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema), // 绑定 Zod 校验
    defaultValues: {
      loginId: "", // 默认值
      password: "",
    },
  });

  // 3. 处理提交逻辑
  // data 是已经通过校验的数据
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      // 发起请求 (使用我们封装的 http 类)
      // 假设后端返回结构: { token: "..." }
      const res = await loginApi(values);
      console.log(res);

      // 保存 Token
      setToken(res.data.token);
      setRefreshToken(res.data.refreshToken);

      setUserInfo(res.data.user);

      toast.success("登录成功");

      // 2. 关键：通知路由系统状态已过期，需要重新加载数据和权限检查
      await router.invalidate();

      //跳转逻辑
      if (redirect) {
        // 如果是外部链接或强制刷新，使用 window.location
        // 如果是站内路由，通常建议用 router.navigate (除非你需要清除内存状态)
        window.location.href = redirect;
      } else {
        await navigate({ to: "/", replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "登录失败，请检查账号密码",
      );
    }
  };

  return {
    form,
    onSubmit,
  };
}
