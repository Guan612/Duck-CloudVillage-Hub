import { CartItem } from "@/types/api-responses";
import { http } from ".";
import { AddToCartParams } from "@/types/api-reqest";

// 获取用户购物车
export const getCartApi = () => {
  return http.get("/cart");
};

// 添加商品到购物车
export const addToCartApi = (data: AddToCartParams) => {
  return http.post<CartItem>("/cart", data);
};

// 更新购物车商品数量
export const updateCartItemApi = (
  id: number,
  data: { quantity: number; checked?: boolean },
) => {
  return http.post(`/cart/${id}`, data);
};

// 删除购物车商品
export const deleteCartItemApi = (id: number) => {
  return http.delete(`/cart/${id}`);
};
