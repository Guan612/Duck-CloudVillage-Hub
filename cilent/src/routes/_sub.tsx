import {
  createFileRoute,
  Outlet,
  useRouter,
  useMatches,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
// 1. 引入侧边栏组件
import { AppSidebar } from "@/components/component/sidebar";
import { AnimatedOutlet } from "@/components/component/animatedOutlet";

export const Route = createFileRoute("/_sub")({
  component: SubLayout,
});

function SubLayout() {
  const router = useRouter();
  const matches = useMatches();
  // 🔥 魔法：自动获取当前子路由定义的 title
  // matches 数组包含了从根到当前页面的所有路由信息，我们取最后一个（当前页）
  const currentMatch = matches[matches.length - 1];
  const title = (currentMatch.staticData as any)?.title || "详情";
  const hideHeader = (currentMatch.staticData as any)?.hideHeader;

  return (
    // 2. 外层容器改为 flex row，为了左右布局
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* 3. 侧边栏：只在 PC (md) 显示，手机隐藏 */}
      <AppSidebar className="hidden md:flex border-r" />

      {/* 4. 右侧内容区域：占据剩余空间 */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* --- 统一顶栏 (Header) --- */}
        {!hideHeader && (
          <header className="sticky top-0 z-50 flex items-center justify-between px-2 py-2 bg-background/80 backdrop-blur-md border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.history.back()}
              className="-ml-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <span className="font-semibold text-base absolute left-1/2 -translate-x-1/2">
              {title}
            </span>

            <div className="w-9" />
          </header>
        )}

        {/* --- 内容区域 --- */}
        <main
          className={cn(
            "flex-1 grid grid-cols-1 grid-rows-1 relative z-0 overflow-hidden",
          )}
        >
          <AnimatedOutlet />
        </main>
        {/* <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "p-4 pb-safe",
             // 🔥 核心修改：
            // 1. mx-auto: 让左右外边距自动相等 -> 水平居中
            // 2. w-full: 确保在没达到 max-w 之前占满宽度
            "md:p-6 md:max-w-4xl mx-auto w-full"
          )}
        >
          <Outlet />
        </main> */}
      </div>
    </div>
  );
}
