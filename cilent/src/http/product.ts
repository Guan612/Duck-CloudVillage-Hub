import { http } from ".";

// 获取商品列表
export const getProductApi = () => {
  return http.get("/product");
};

// 获取商品详情
export const getProductDetailApi = (id: number) => {
  return http.get(`/product/${id}`);
};

// 创建商品（需要管理员权限）
export const createProductApi = (data: {
  name: string;
  description?: string;
  price: number;
  imgUrl?: string;
  quantity: number;
  category?: string;
}) => {
  return http.post("/product", data);
};

// 更新商品（需要管理员权限）
export const updateProductApi = (id: number, data: {
  name?: string;
  description?: string;
  price?: number;
  imgUrl?: string;
  quantity?: number;
  category?: string;
}) => {
  return http.patch(`/product/${id}`, data);
};
