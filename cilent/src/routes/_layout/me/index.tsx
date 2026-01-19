import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/hooks/auth/useAuthGurad";
import { cn } from "@/lib/utils";
import { themeAtom } from "@/store";
import { tokenAtom, userInfoAtom } from "@/store/auth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  CalendarCheck,
  Coins,
  Edit2,
  Laptop,
  MessageSquare,
  Moon,
  Settings2,
  ShoppingCart,
  Sun,
  ThumbsUp,
} from "lucide-react";

export const Route = createFileRoute("/_layout/me/")({
  component: RouteComponent,
  beforeLoad: ({ location }) => requireAuth(location.href),
});

function RouteComponent() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const setToken = useSetAtom(tokenAtom);
  const navigate = useNavigate();
  const logout = () => {
    setToken(null);
    setUserInfo(null);
  };
  return (
    <div className="p-6 space-y-4">
      <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/20 overflow-hidden relative">
        {/* 背景装饰：右上角的光晕 */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <CardContent className="p-5 space-y-6">
          {/* 1. 顶部：头像与基本信息 */}
          <div className="flex items-center gap-4 relative z-10">
            {/* 头像 */}
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm cursor-pointer">
              <AvatarImage src={userInfo?.avatarUrl} alt={userInfo?.nickname} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {userInfo?.nickname}
              </AvatarFallback>
            </Avatar>

            {/* 信息区域 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold truncate text-foreground">
                  {userInfo?.nickname || "未登录用户"}
                </h2>
                {/* 身份标识 */}
              </div>

              <p className="text-xs text-muted-foreground truncate mb-1">
                ID: {userInfo?.id}
              </p>
            </div>

            {/* 右侧动作：签到或编辑 */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                className={`h-8 px-3 rounded-full text-xs font-bold shadow-sm`}
                //variant={userInfo.isSignedIn ? "ghost" : "default"}
                onClick={() => navigate({ to: "/me/editUserInfo" })}
              >
                <Edit2 size={14} className="mr-1" />
                编辑个人信息
              </Button>
            </div>
          </div>

          {/* 2. 底部：数据概览 (Flex 布局自动平分) */}
          <div className="flex items-center justify-between px-2">
            {/* 积分 (点击去商城) */}
            <StatItem
              icon={Coins}
              value={0}
              label="我的积分"
              color="text-yellow-600"
              onClick={() => console.log("跳转到积分商城")}
            />
            <div className="w-[1px] h-8 bg-border/50" /> {/* 竖分割线 */}
            {/* 动态 (点击去我的发布) */}
            <StatItem
              icon={MessageSquare}
              value={10}
              label="我的发布"
              color="text-blue-600"
            />
            <div className="w-[1px] h-8 bg-border/50" />
            {/* 获赞 */}
            <StatItem
              icon={ThumbsUp}
              value={10}
              label="获赞数"
              color="text-red-500"
            />
          </div>
        </CardContent>
      </Card>

      <Link to="/setting" className="flex border p-4 rounded-xl items-center">
        <Settings2 className="h-[1.2rem] w-[1.2rem] mx-1" />
        <div className="font-bold">应用设置</div>
      </Link>

      <Link to="/cart" className="flex border p-4 rounded-xl items-center">
        <ShoppingCart className="h-[1.2rem] w-[1.2rem] mx-1" />
        <div className="font-bold">购物车</div>
      </Link>
    </div>
  );
}

function StatItem({ icon: Icon, value, label, color, onClick }: any) {
  return (
    <button
      className="flex-1 flex flex-col items-center gap-1 active:scale-95 transition-transform"
      onClick={onClick}
    >
      <div className="flex items-end gap-1.5">
        <span
          className={`text-lg font-bold font-mono ${color ? "" : "text-foreground"}`}
        >
          {value}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {/* Icon 可选显示，这里如果不显示 Icon 会更简洁 */}
        <Icon size={12} className="opacity-70" />
        <span>{label}</span>
      </div>
    </button>
  );
}
