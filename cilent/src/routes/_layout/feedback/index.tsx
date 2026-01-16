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

export const Route = createFileRoute("/_layout/feedback/")({
  component: FeedbackPage,
});

// --- 模拟数据 ---
const FEEDBACK_LIST = [
  {
    id: 1,
    user: { name: "多吉", avatar: "D" },
    type: "infrastructure", // 基础设施
    status: "solved",
    title: "村口的路灯坏了三天了，晚上太黑",
    content: "特别是下雨天，老人走路很不方便，希望能尽快派人来修一下。",
    location: "二组村口",
    time: "2小时前",
    likes: 12,
    comments: 2,
    reply: "村委会回复：已收到反馈，电工师傅将于明天上午前往维修。",
  },
  {
    id: 2,
    user: { name: "卓玛", avatar: "Z" },
    type: "suggestion", // 建议
    status: "pending",
    title: "建议在广场增加一些健身器材",
    content: "现在的器材有点老旧了，而且数量不够，晚上大家都要排队。",
    location: "文化广场",
    time: "5小时前",
    likes: 45,
    comments: 8,
    reply: null,
  },
  {
    id: 3,
    user: { name: "扎西", avatar: "Z" },
    type: "policy", // 政策
    status: "pending",
    title: "今年的农业补贴什么时候发放？",
    content: "想问一下关于青稞种植的补贴标准有没有变化。",
    location: null,
    time: "1天前",
    likes: 5,
    comments: 0,
    reply: null,
  },
];

function FeedbackPage() {
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

          {/* 下方：快捷分类 (可选) */}
          {/* <QuickBtn
            icon={Wrench}
            label="设施报修"
            color="text-blue-600 bg-blue-50"
          />
          <QuickBtn
            icon={HelpCircle}
            label="政策咨询"
            color="text-orange-600 bg-orange-50"
          /> */}
        </div>
      </div>

      {/* 3. 反馈列表区域 */}
      <div className="px-4">
        <Tabs defaultValue="all" className="w-full">
          {/* 吸顶的 Tab 栏 */}
          <div className="sticky top-0 z-10 bg-muted/20 backdrop-blur-md pt-2 pb-4 -mx-4 px-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-background/80 h-9">
                <TabsTrigger value="all" className="text-xs">
                  全部反馈
                </TabsTrigger>
                <TabsTrigger value="solved" className="text-xs">
                  已回复
                </TabsTrigger>
                <TabsTrigger value="my" className="text-xs">
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
            {FEEDBACK_LIST.map((item) => (
              <FeedbackCard key={item.id} data={item} />
            ))}
            <div className="text-center text-xs text-muted-foreground py-6">
              没有更多了
            </div>
          </TabsContent>

          <TabsContent value="solved">
            <div className="py-10 text-center text-muted-foreground text-sm">
              暂无更多已回复内容
            </div>
          </TabsContent>

          <TabsContent value="my">
            <div className="py-10 text-center text-muted-foreground text-sm">
              您还没有提交过反馈
            </div>
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
function FeedbackCard({ data }: { data: (typeof FEEDBACK_LIST)[0] }) {
  const isSolved = data.status === "solved";

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 space-y-3">
      {/* 头部：用户信息 + 状态 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {data.user.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold">{data.user.name}</p>
            <p className="text-[10px] text-muted-foreground">{data.time}</p>
          </div>
        </div>

        {/* 状态徽标 */}
        <Badge
          //   variant={isSolved ? "default" : "secondary"}
          className={`text-[10px] h-5 px-1.5 gap-1 ${isSolved ? "bg-green-600 hover:bg-green-700" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
        >
          {isSolved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
          {isSolved ? "已回复" : "处理中"}
        </Badge>
      </div>

      {/* 内容区 */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold line-clamp-1">{data.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {data.content}
        </p>
        {/* 地点标签 */}
        {data.location && (
          <div className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1">
            <MapPin size={10} />
            {data.location}
          </div>
        )}
      </div>

      {/* 官方回复区 (如果有) */}
      {data.reply && (
        <div className="bg-muted/50 rounded-lg p-2 text-xs text-foreground/80 border-l-2 border-primary">
          <span className="font-bold text-primary mr-1">官方回复:</span>
          {data.reply}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ThumbsUp size={14} />
            <span>{data.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle size={14} />
            <span>{data.comments}</span>
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
