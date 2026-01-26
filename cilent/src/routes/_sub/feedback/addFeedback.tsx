import { requireAuth } from "@/hooks/auth/useAuthGurad";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFeedbacks from "@/hooks/feedback/useFeedbacks";
import { uploadApi } from "@/http/upload";
import { useState } from "react";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_sub/feedback/addFeedback")({
  component: RouteComponent,
  beforeLoad: ({ location }) => requireAuth(location.href),
  staticData: {
    title: "新建反馈",
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { createFeedback } = useFeedbacks();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadApi(file);
        if (res.code === 0 && res.data) {
          newUrls.push(res.data.url);
        }
      }

      setImageUrls((prev) => [...prev, ...newUrls]);
      toast.success(`成功上传 ${newUrls.length} 张图片`);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("图片上传失败");
    } finally {
      setUploading(false);
      // 清空input，允许重复选择同一文件
      e.target.value = "";
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 提交反馈
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("请输入反馈标题");
      return;
    }
    if (content.length < 10) {
      toast.error("反馈内容至少需要10个字符");
      return;
    }

    setSubmitting(true);
    const result = await createFeedback({ title, content, imageUrls });
    setSubmitting(false);

    if (result) {
      navigate({ to: "/feedback" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      {/* 顶部 Header */}
      <div className="px-4 py-4 bg-background border-b border-border/50">
        <h1 className="text-xl font-bold">新建反馈</h1>
      </div>

      {/* 表单内容 */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>填写反馈信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">
                反馈标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="请简要描述您的问题或建议"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100
              </p>
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">
                反馈内容 <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="content"
                placeholder="请详细描述您的问题或建议，至少10个字符"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                {content.length}/500
              </p>
            </div>

            {/* 图片上传 */}
            <div className="space-y-2">
              <Label>上传图片（可选）</Label>
              <div className="space-y-3">
                {/* 上传按钮 */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading || imageUrls.length >= 9}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
                      <Upload size={16} />
                      <span className="text-sm text-primary">
                        {uploading ? "上传中..." : "选择图片"}
                      </span>
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    最多上传9张图片，单张不超过10MB
                  </p>
                </div>

                {/* 图片预览 */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                      >
                        <img
                          src={`http://localhost:3000${url}`}
                          alt={`上传图片${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/feedback" })}
                disabled={submitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="flex-1"
              >
                {submitting ? "提交中..." : "提交反馈"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
