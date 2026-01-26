import { http } from ".";
import type { Feedback, FeedbackComment, FeedbackReply } from "@/types/api-responses";

// 获取反馈列表
export const getFeedbacksApi = (params?: { status?: string }) => {
  return http.get<Feedback[]>("/feedback", { params });
};

// 获取反馈详情
export const getFeedbackDetailApi = (id: number) => {
  return http.get<Feedback>(`/feedback/${id}`);
};

// 创建反馈
export const createFeedbackApi = (data: { title: string; content: string; imageUrls?: string[] }) => {
  return http.post<Feedback>("/feedback", data);
};

// 更新反馈
export const updateFeedbackApi = (id: number, data: { charge?: number; status?: number; title?: string; content?: string }) => {
  return http.patch<Feedback>(`/feedback/${id}`, data);
};

// 删除反馈
export const deleteFeedbackApi = (id: number) => {
  return http.delete(`/feedback/${id}`);
};

// ==================== 点赞相关 ====================

// 点赞反馈
export const likeFeedbackApi = (id: number) => {
  return http.post(`/feedback/likes/${id}`);
};

// 取消点赞
export const unlikeFeedbackApi = (id: number) => {
  return http.delete(`/feedback/likes/${id}`);
};

// 检查是否已点赞
export const checkLikeApi = (id: number) => {
  return http.get<{ isLiked: boolean }>(`/feedback/likes/${id}`);
};

// ==================== 评论相关 ====================

// 获取反馈的评论列表
export const getFeedbackCommentsApi = (id: number) => {
  return http.get<FeedbackComment[]>(`/feedback/comments/${id}`);
};

// 创建评论
export const createFeedbackCommentApi = (id: number, data: { content: string }) => {
  return http.post<FeedbackComment>(`/feedback/comments/${id}`, data);
};

// 删除评论
export const deleteFeedbackCommentApi = (commentId: number) => {
  return http.delete(`/feedback/comments/${commentId}`);
};

// ==================== 官方回复相关 ====================

// 获取反馈的官方回复列表
export const getFeedbackRepliesApi = (id: number) => {
  return http.get<FeedbackReply[]>(`/feedback/replies/${id}`);
};

// 创建官方回复
export const createFeedbackReplyApi = (id: number, data: { content: string }) => {
  return http.post<FeedbackReply>(`/feedback/replies/${id}`, data);
};

// 更新官方回复
export const updateFeedbackReplyApi = (replyId: number, data: { content: string }) => {
  return http.patch<FeedbackReply>(`/feedback/replies/${replyId}`, data);
};

// 删除官方回复
export const deleteFeedbackReplyApi = (replyId: number) => {
  return http.delete(`/feedback/replies/${replyId}`);
};
