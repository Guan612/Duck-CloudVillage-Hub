import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Filter,
  HelpCircle,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
  ThumbsUp,
} from "lucide-react";
import useFeedbacks from "@/hooks/feedback/useFeedbacks";
import { useEffect } from "react";

export const Route = createFileRoute("/_layout/feedback/")({
  component: FeedbackPage,
});

function FeedbackPage() {
  const {
    feedbacks,
    loading,
    getFeedbackList,
    formatRelativeTime,
    getStatusText,
  } = useFeedbacks();

  useEffect(() => {
    getFeedbackList();
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 pb-24 relative">
      {/* 1. 顶部 Header (普通流) */}
      <div className="px-4 py-4 bg-background">
        <h1 className="text-2xl font-bold tracking-tight">村民反馈</h1>
        <p className="text-sm text-muted-foreground mt-1">
          您的声音，是我们进步的动力
        </p>
      </div>

      {/* 2. 反馈类型入口 (金刚区) */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* 左侧：大大的主要入口 */}
          <Link to="/feedback/addFeedback" className="col-span-2">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
              <div>
                <h3 className="text-lg font-bold text-primary">我要反馈</h3>
                <p className="text-xs text-primary/70">
                  设施报修 · 矛盾调解 · 意见建议
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                <MessageSquarePlus size={20} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. 反馈列表区域 */}
      <div className="px-4">
        <Tabs defaultValue="all" className="w-full">
          {/* 吸顶的 Tab 栏 */}
          <div className="sticky top-0 z-10 bg-muted/20 backdrop-blur-md pt-2 pb-4 -mx-4 px-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-background/80 h-9">
                <TabsTrigger
                  value="all"
                  className="text-xs"
                  onClick={() => getFeedbackList()}
                >
                  全部反馈
                </TabsTrigger>
                <TabsTrigger
                  value="solved"
                  className="text-xs"
                  onClick={() => getFeedbackList("2")}
                >
                  已回复
                </TabsTrigger>
                <TabsTrigger
                  value="my"
                  className="text-xs"
                  onClick={() => getFeedbackList()}
                >
                  我的
                </TabsTrigger>
              </TabsList>

              {/* 筛选按钮 (可选) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <Filter size={16} />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-3 mt-0">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                加载中...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                暂无反馈
              </div>
            ) : (
              feedbacks.map((item) => (
                <FeedbackCard key={item.id} data={item} />
              ))
            )}
          </TabsContent>

          <TabsContent value="solved">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                加载中...
              </div>
            ) : feedbacks.filter((f) => f.hasReply).length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                暂无已回复内容
              </div>
            ) : (
              feedbacks
                .filter((f) => f.hasReply)
                .map((item) => <FeedbackCard key={item.id} data={item} />)
            )}
          </TabsContent>

          <TabsContent value="my">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                加载中...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                您还没有提交过反馈
              </div>
            ) : (
              feedbacks.map((item) => (
                <FeedbackCard key={item.id} data={item} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 4. 悬浮按钮 (FAB) - 方便用户滚动到底部时也能反馈 */}
      <Link
        to="/feedback/addFeedback"
        className="fixed bottom-24 right-4 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform z-20 md:hidden"
      >
        <MessageSquarePlus size={24} />
      </Link>
    </div>
  );
}

// --- 子组件：反馈卡片 ---
function FeedbackCard({ data }: { data: any }) {
  const { toggleLike, formatRelativeTime, getStatusText } = useFeedbacks();
  const statusInfo = getStatusText(data.status);
  const isSolved = data.status === 2;

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 space-y-3">
      {/* 头部：用户信息 + 状态 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={data.giverUser?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {data.giverUser?.nickname?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold">{data.giverUser?.nickname}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatRelativeTime(data.createdAt)}
            </p>
          </div>
        </div>

        {/* 状态徽标 */}
        <Badge
          className={`text-[10px] h-5 px-1.5 gap-1 ${
            isSolved
              ? "bg-green-600 hover:bg-green-700"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          {isSolved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
          {statusInfo.text}
        </Badge>
      </div>

      {/* 内容区 */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold line-clamp-1">{data.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {data.content}
        </p>
        {/* 图片预览 */}
        {data.imageUrls && data.imageUrls.length > 0 && (
          <div className="flex gap-2 mt-2">
            {data.imageUrls.slice(0, 3).map((url: string, index: number) => (
              <img
                key={index}
                src={`http://localhost:3000${url}`}
                alt="反馈图片"
                className="w-16 h-16 object-cover rounded-lg"
              />
            ))}
            {data.imageUrls.length > 3 && (
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                +{data.imageUrls.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 官方回复区 (如果有) */}
      {data.hasReply && (
        <div className="bg-muted/50 rounded-lg p-2 text-xs text-foreground/80 border-l-2 border-primary">
          <span className="font-bold text-primary mr-1">官方回复:</span>
          已回复
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex gap-4">
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={() => toggleLike(data.id)}
          >
            <ThumbsUp
              size={14}
              className={data.isLiked ? "fill-primary" : ""}
            />
            <span>{data.likesCount || 0}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle size={14} />
            <span>{data.commentsCount || 0}</span>
          </button>
        </div>
        <Link
          to="/feedback/$feedbackId"
          params={{ feedbackId: String(data.id) }}
          className="text-xs text-primary font-medium hover:underline"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
