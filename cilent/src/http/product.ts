import { http } from ".";
import type { Product } from "@/types/api-responses";
import type { ApiResponse } from "@/types/api";

// 获取商品列表
export const getProductApi = () => {
  return http.get<Product[]>("/product");
};

// 获取商品详情
export const getProductDetailApi = (id: number) => {
  return http.get<Product>(`/product/${id}`);
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
  return http.post<Product>("/product", data);
};

// 更新商品（需要管理员权限）
export const updateProductApi = (
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: number;
    imgUrl?: string;
    quantity?: number;
    category?: string;
  },
) => {
  return http.patch<Product>(`/product/${id}`, data);
};
