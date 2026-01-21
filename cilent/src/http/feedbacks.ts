import { http } from ".";

// 获取反馈列表
export const getFeedbacksApi = (params?: { status?: string }) => {
  return http.get("/feedback", { params });
};

// 获取反馈详情
export const getFeedbackDetailApi = (id: number) => {
  return http.get(`/feedback/${id}`);
};

// 创建反馈
export const createFeedbackApi = (data: { title: string; content: string }) => {
  return http.post("/feedback", data);
};

// 更新反馈
export const updateFeedbackApi = (id: number, data: { charge?: number; status?: number; title?: string; content?: string }) => {
  return http.patch(`/feedback/${id}`, data);
};

// 删除反馈
export const deleteFeedbackApi = (id: number) => {
  return http.delete(`/feedback/${id}`);
};
