import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/theme/useTheme";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Laptop, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/_sub/setting/")({
  component: RouteComponent,
  staticData: {
    title: "应用设置",
  },
});

function RouteComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <div className="border p-4 rounded-xl">
        <h3 className="font-bold">主题设置</h3>
        <p className="text-sm text-gray-500 mb-2">当前: {theme}</p>
        <div className="flex items-center gap-2">
          {/* 浅色按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("light")}
            className={cn(theme === "light" && "bg-muted text-primary")}
            title="浅色模式"
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </Button>

          {/* 深色按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("dark")}
            className={cn(theme === "dark" && "bg-muted text-primary")}
            title="深色模式"
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </Button>

          {/* 跟随系统按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("system")}
            className={cn(theme === "system" && "bg-muted text-primary")}
            title="跟随系统"
          >
            <Laptop className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
