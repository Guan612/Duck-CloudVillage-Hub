import {
  getFeedbacksApi,
  getFeedbackDetailApi,
  createFeedbackApi,
  likeFeedbackApi,
  unlikeFeedbackApi,
  checkLikeApi,
  getFeedbackCommentsApi,
  createFeedbackCommentApi,
  deleteFeedbackCommentApi,
  getFeedbackRepliesApi,
} from "@/http/feedbacks";
import type { Feedback, FeedbackComment, FeedbackReply } from "@/types/api-responses";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取反馈列表
  const getFeedbackList = async (status?: string) => {
    setLoading(true);
    try {
      const res = await getFeedbacksApi({ status });
      if (res.code === 0) {
        setFeedbacks(res.data || []);
      }
    } catch (error) {
      console.error("获取反馈列表失败:", error);
      toast.error("获取反馈列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取反馈详情
  const getFeedbackDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await getFeedbackDetailApi(id);
      if (res.code === 0) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("获取反馈详情失败:", error);
      toast.error("获取反馈详情失败");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 创建反馈
  const createFeedback = async (data: {
    title: string;
    content: string;
    imageUrls?: string[];
  }) => {
    setLoading(true);
    try {
      const res = await createFeedbackApi(data);
      if (res.code === 0) {
        toast.success("反馈提交成功");
        await getFeedbackList(); // 刷新列表
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("创建反馈失败:", error);
      toast.error("反馈提交失败");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 点赞反馈
  const toggleLike = async (feedbackId: number) => {
    try {
      // 先检查是否已点赞
      const checkRes = await checkLikeApi(feedbackId);
      if (checkRes.code === 0 && checkRes.data?.isLiked) {
        // 已点赞，取消点赞
        const res = await unlikeFeedbackApi(feedbackId);
        if (res.code === 0) {
          setFeedbacks((prev) =>
            prev.map((item) =>
              item.id === feedbackId
                ? { ...item, isLiked: false, likesCount: (item.likesCount || 0) - 1 }
                : item,
            ),
          );
          toast.success("取消点赞");
        }
      } else {
        // 未点赞，点赞
        const res = await likeFeedbackApi(feedbackId);
        if (res.code === 0) {
          setFeedbacks((prev) =>
            prev.map((item) =>
              item.id === feedbackId
                ? { ...item, isLiked: true, likesCount: (item.likesCount || 0) + 1 }
                : item,
            ),
          );
          toast.success("点赞成功");
        }
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
      toast.error("操作失败");
    }
  };

  // 获取评论列表
  const getComments = async (feedbackId: number) => {
    try {
      const res = await getFeedbackCommentsApi(feedbackId);
      if (res.code === 0) {
        return res.data || [];
      }
      return [];
    } catch (error) {
      console.error("获取评论列表失败:", error);
      toast.error("获取评论列表失败");
      return [];
    }
  };

  // 创建评论
  const createComment = async (feedbackId: number, content: string) => {
    try {
      const res = await createFeedbackCommentApi(feedbackId, { content });
      if (res.code === 0) {
        toast.success("评论成功");
        // 更新评论数
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === feedbackId
              ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
              : item,
          ),
        );
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("创建评论失败:", error);
      toast.error("评论失败");
      return null;
    }
  };

  // 删除评论
  const deleteComment = async (commentId: number, feedbackId: number) => {
    try {
      const res = await deleteFeedbackCommentApi(commentId);
      if (res.code === 0) {
        toast.success("删除评论成功");
        // 更新评论数
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === feedbackId
              ? { ...item, commentsCount: Math.max((item.commentsCount || 0) - 1, 0) }
              : item,
          ),
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("删除评论失败:", error);
      toast.error("删除评论失败");
      return false;
    }
  };

  // 获取官方回复列表
  const getReplies = async (feedbackId: number) => {
    try {
      const res = await getFeedbackRepliesApi(feedbackId);
      if (res.code === 0) {
        return res.data || [];
      }
      return [];
    } catch (error) {
      console.error("获取官方回复列表失败:", error);
      toast.error("获取官方回复列表失败");
      return [];
    }
  };

  // 格式化时间（相对时间）
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date().getTime();
    const time = new Date(date).getTime();
    const diff = now - time;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    if (diff < minute) {
      return "刚刚";
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < month) {
      return `${Math.floor(diff / day)}天前`;
    } else if (diff < year) {
      return `${Math.floor(diff / month)}个月前`;
    } else {
      return `${Math.floor(diff / year)}年前`;
    }
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      0: { text: "待处理", color: "text-orange-600" },
      1: { text: "处理中", color: "text-blue-600" },
      2: { text: "已解决", color: "text-green-600" },
      3: { text: "已关闭", color: "text-gray-600" },
    };
    return statusMap[status] || { text: "未知", color: "text-gray-600" };
  };

  return {
    feedbacks,
    loading,
    getFeedbackList,
    getFeedbackDetail,
    createFeedback,
    toggleLike,
    getComments,
    createComment,
    deleteComment,
    getReplies,
    formatRelativeTime,
    getStatusText,
  };
}
