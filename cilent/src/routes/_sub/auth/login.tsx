import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2 } from "lucide-react"; // 引入 Loading 图标
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useLogin, { loginSearchSchema } from "@/hooks/auth/useLogin";

export const Route = createFileRoute("/_sub/auth/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
  staticData: {
    title: "登录",
  },
});

function LoginPage() {
  // ✅ 1. 在组件层获取 search 参数 (TanStack Router 的最佳实践)
  const search = Route.useSearch();

  // ✅ 2. 将参数传给 Hook
  const { form, onSubmit } = useLogin({
    redirect: search.redirect,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
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
