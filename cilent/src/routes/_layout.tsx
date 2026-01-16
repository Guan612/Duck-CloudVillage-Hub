import { AppSidebar } from "@/components/component/sidebar";
import { useThemeEffect } from "@/hooks/theme/useThemeEffect";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Home,
  User,
  Sprout, // 嫩芽，代表农业/乡村
  CloudSun, // 云/天气
  Menu,
  Settings,
} from "lucide-react";

export const Route = createFileRoute("/_layout")({
  component: AppLayout,
});

// 1. 定义导航菜单配置
// 这样无论是在侧边栏还是底部栏，都共用这一份数据
const navItems = [
  { to: "/", label: "乡村概览", icon: Home },
  { to: "/product", label: "云上集市", icon: CloudSun }, // 假设你有这个路由
  { to: "/feedback", label: "村民反馈", icon: Sprout }, // 假设你有这个路由
  { to: "/me", label: "我的", icon: User },
];

function AppLayout() {
  useThemeEffect();
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* ------------------- 桌面端：左侧侧边栏 ------------------- */}
      <AppSidebar className="hidden md:flex" />

      {/* ------------------- 主内容区域 ------------------- */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* 顶部 Header (移动端/桌面端通用，可根据需要隐藏) */}
        <header className="z-20 flex flex-col justify-center border-b border-border bg-background/95 px-6 backdrop-blur pt-safe min-h-14">
          {/* 移动端显示的 Logo (桌面端侧边栏已有，故隐藏) */}
          <div className="flex items-center gap-4 py-2">
            <div className="md:hidden flex items-center gap-2 font-semibold text-primary">
              <Sprout size={20} />
              <span>云上乡村</span>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              今日天气：晴 24°C
            </div>
          </div>
        </header>

        {/* 路由出口 (内容滚动区) */}
        <main className="flex-1 overflow-y-auto bg-muted/20 scrollbar-hide pb-24 md:pb-6">
          <div className="mx-auto max-w-5xl h-full">
            <Outlet />
          </div>
        </main>

        {/* ------------------- 移动端：底部导航栏 ------------------- */}
        {/* 仅在 md 以下显示 (md:hidden) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe border-t border-border/40 bg-card/50 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-primary/10"
                activeProps={{
                  className: "text-primary font-bold",
                }}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
