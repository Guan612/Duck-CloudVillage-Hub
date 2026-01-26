import { createFileRoute, useParams } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFeedbacks from "@/hooks/feedback/useFeedbacks";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ThumbsUp, MessageCircle, Send, CheckCircle2, Clock, Image as ImageIcon, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/feedback/$feedbackId")({
  component: RouteComponent,
  staticData: {
    title: "反馈详情",
  },
});

function RouteComponent() {
  const params = useParams({ strict: false });
  const feedbackId = Number(params.feedbackId);
  
  const {
    getFeedbackDetail,
    toggleLike,
    getComments,
    createComment,
    deleteComment,
    getReplies,
    formatRelativeTime,
    getStatusText,
  } = useFeedbacks();
  
  const [feedback, setFeedback] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // 加载反馈详情
  useEffect(() => {
    loadFeedbackDetail();
  }, [feedbackId]);

  const loadFeedbackDetail = async () => {
    setLoading(true);
    const detail = await getFeedbackDetail(feedbackId);
    if (detail) {
      setFeedback(detail);
      // 加载评论和回复
      const [commentsData, repliesData] = await Promise.all([
        getComments(feedbackId),
        getReplies(feedbackId),
      ]);
      setComments(commentsData);
      setReplies(repliesData);
    }
    setLoading(false);
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error("请输入评论内容");
      return;
    }

    setSubmittingComment(true);
    const newComment = await createComment(feedbackId, commentContent);
    setSubmittingComment(false);

    if (newComment) {
      setCommentContent("");
      // 重新加载评论列表
      const updatedComments = await getComments(feedbackId);
      setComments(updatedComments);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    const success = await deleteComment(commentId, feedbackId);
    if (success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const statusInfo = getStatusText(feedback?.status || 0);
  const isSolved = feedback?.status === 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">反馈不存在</div>
          <Link to="/feedback" className="text-primary mt-4 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      {/* 顶部导航 */}
      <div className="px-4 py-3 bg-background border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/feedback">
            <Button variant="ghost" size="icon">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">反馈详情</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* 反馈卡片 */}
        <Card>
          <CardContent className="pt-6">
            {/* 反馈人信息 */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={feedback.giverUser?.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {feedback.giverUser?.nickname?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{feedback.giverUser?.nickname}</span>
                  <Badge
                    className={`text-xs h-5 px-1.5 gap-1 ${
                      isSolved
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    {isSolved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {statusInfo.text}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(feedback.createdAt)}
                </div>
              </div>
            </div>

            {/* 反馈标题和内容 */}
            <div className="space-y-3 mb-4">
              <h2 className="text-xl font-bold">{feedback.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {feedback.content}
              </p>
            </div>

            {/* 图片展示 */}
            {feedback.imageUrls && feedback.imageUrls.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">附件图片</span>
                  <span className="text-xs text-muted-foreground">
                    ({feedback.imageUrls.length}张)
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {feedback.imageUrls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={`http://localhost:3000${url}`}
                      alt={`反馈图片${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 互动区：点赞和评论数 */}
            <div className="flex items-center gap-4 py-3 border-t border-border/50">
              <button
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => toggleLike(feedback.id)}
              >
                <ThumbsUp
                  size={16}
                  className={feedback.isLiked ? "fill-primary text-primary" : ""}
                />
                <span>{feedback.likesCount || 0}</span>
              </button>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle size={16} />
                <span>{feedback.commentsCount || 0}条评论</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 官方回复区 */}
        {replies.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" />
                官方回复
              </h3>
              <div className="space-y-4">
                {replies.map((reply: any) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.replier?.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {reply.replier?.nickname?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">
                          {reply.replier?.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 评论区 */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              用户评论
              <span className="text-sm text-muted-foreground font-normal">
                ({comments.length})
              </span>
            </h3>

            {/* 评论输入框 */}
            <div className="mb-6 space-y-3">
              <Label htmlFor="comment">发表评论</Label>
              <div className="flex gap-2">
                <Input
                  id="comment"
                  placeholder="写下你的评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  maxLength={500}
                  disabled={submittingComment}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !commentContent.trim()}
                  size="icon"
                >
                  {submittingComment ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>

            {/* 评论列表 */}
            {comments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                暂无评论，快来发表第一条评论吧！
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {comment.user?.nickname?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {comment.user?.nickname}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
