import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { tokenAtom, userInfoAtom } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sprout, Loader2 } from "lucide-react"; // 引入 Loading 图标
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginApi } from "@/http/auth";

// 1. 定义 Zod 校验 Schema
// 这定义了表单的“形状”和校验规则
const loginSchema = z.object({
  loginId: z.string().min(1, "请输入用户名/手机号").max(20, "用户名过长"),
  password: z.string().min(6, "密码至少需要6位"),
});

// 定义 URL 参数验证
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const setToken = useSetAtom(tokenAtom);
  const setUserInfo = useSetAtom(userInfoAtom);
  const router = useRouter();
  const navigate = useNavigate();
  const search = Route.useSearch();

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
      setUserInfo(res.data.user);

      toast.success("登录成功");

      // 2. 关键：通知路由系统状态已过期，需要重新加载数据和权限检查
      await router.invalidate();

      //跳转逻辑
      if (search.redirect) {
        window.location.href = search.redirect;
      } else {
        await navigate({ to: "/", replace: true });
      }
    } catch (error) {
      // 错误处理
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "登录失败，请检查账号密码",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-background p-8 shadow-lg">
        {/* Logo 和 标题 */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center text-primary bg-primary/10 p-3 rounded-xl">
            <Sprout size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            欢迎回到云上乡村
          </h1>
          <p className="text-sm text-muted-foreground">请输入您的账号和密码</p>
        </div>

        {/* 4. 渲染表单 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 用户名 */}
            <FormField
              control={form.control}
              name="loginId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入登录id" {...field} />
                  </FormControl>
                  <FormMessage /> {/* 自动显示 Zod 的错误信息 */}
                </FormItem>
              )}
            />

            {/* 密码 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            {/* 使用 form.formState.isSubmitting 自动处理加载状态 */}
            <Button
              type="submit"
              className="w-full font-bold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "立即登录"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground">
          未注册用户登录时将自动创建账号
        </p>
      </div>
    </div>
  );
}
