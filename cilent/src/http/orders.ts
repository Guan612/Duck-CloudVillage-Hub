import { http } from ".";

// 获取用户订单列表
export const getOrdersApi = (params?: { status?: string }) => {
  return http.get("/order", { params });
};

// 获取订单详情
export const getOrderDetailApi = (id: number) => {
  return http.get(`/order/${id}`);
};

// 创建订单
export const createOrderApi = (data: { items: Array<{ productId: number; quantity: number }> }) => {
  return http.post("/order", data);
};

// 更新订单状态
export const updateOrderStatusApi = (id: number, data: { status: number }) => {
  return http.patch(`/order/${id}/status`, data);
};

// 删除订单
export const deleteOrderApi = (id: number) => {
  return http.delete(`/order/${id}`);
};
