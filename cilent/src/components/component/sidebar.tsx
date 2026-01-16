import { Link } from "@tanstack/react-router";
import { Home, User, Sprout, CloudSun, Settings } from "lucide-react";

// 定义菜单数据 (如果有的话)
const navItems = [
  { to: "/", label: "乡村概览", icon: Home },
  { to: "/product", label: "积分商城", icon: Sprout }, // 注意这里改成了 /product
  { to: "/feedback", label: "村民反馈", icon: CloudSun },
  { to: "/me", label: "我的", icon: User },
];

export function AppSidebar({ className }: { className?: string }) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar px-4 py-6 py-safe">
      {/* Logo 区域 */}
      <div className="flex items-center gap-2 h-16 px-2 justify-center">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Sprout size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
          云上乡村
        </span>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className:
                "bg-sidebar-accent text-primary font-semibold shadow-sm",
            }}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 底部设置/退出 */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Link
          to="/about"
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Settings size={18} />
          关于我们
        </Link>
      </div>
    </aside>
  );
}
