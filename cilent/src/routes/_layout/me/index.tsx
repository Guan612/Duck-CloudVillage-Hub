import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { themeAtom, tokenAtom } from "@/store";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Laptop, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/_layout/me/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [token, setToken] = useAtom(tokenAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <div className="p-6 space-y-4">
      <div className="border p-4 rounded-xl">
        <h3 className="font-bold">Token 状态</h3>
        <p className="text-sm text-gray-500 mb-2">{token || "暂无 Token"}</p>
        <Button
          onClick={() => setToken("new-token-" + Date.now())}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          生成新 Token
        </Button>
      </div>

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
