import type { ApiResponse } from "./api";

// ==================== 认证相关 ====================
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    loginId: string;
    nickname: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface RegisterResponse {
  id: number;
  loginId: string;
  nickname: string;
  role: string;
  createdAt: Date;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// ==================== 商品相关 ====================
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imgUrl?: string;
  quantity: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== 购物车相关 ====================
export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  checked?: boolean;
  product?: Product;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== 订单相关 ====================
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  orderNo: string;
  totalPrice: number;
  status: number; // 0: 待支付, 1: 已支付, 2: 已发货, 3: 已完成
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

// ==================== 用户相关 ====================
export interface User {
  id: number;
  loginId: string;
  nickname: string;
  avatarUrl?: string;
  role: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileResponse {
  id: number;
  loginId: string;
  nickname: string;
  updatedAt: Date;
}

// ==================== 反馈相关 ====================
export interface FeedbackUser {
  id: number;
  loginId: string;
  nickname: string;
  avatarUrl?: string;
}

export interface Feedback {
  id: number;
  giver: number;
  charge?: number;
  title: string;
  content: string;
  status: number; // 0: 待处理, 1: 处理中, 2: 已解决, 3: 已关闭
  createdAt: Date;
  updatedAt: Date;
  giverUser?: FeedbackUser;
  chargeUser?: FeedbackUser;
}

// ==================== API响应类型映射 ====================
export type ApiResponses = {
  // 认证
  "/auth/login": ApiResponse<LoginResponse>;
  "/auth/register": ApiResponse<RegisterResponse>;
  "/auth/refresh": ApiResponse<RefreshTokenResponse>;
  
  // 商品
  "/product": ApiResponse<Product[]>;
  "/product/{id}": ApiResponse<Product>;
  
  // 购物车
  "/cart": ApiResponse<CartItem[]>;
  "/cart/{id}": ApiResponse<CartItem>;
  
  // 订单
  "/order": ApiResponse<Order[]>;
  "/order/{id}": ApiResponse<Order>;
  "/order/{id}/status": ApiResponse<Order>;
  
  // 用户
  "/user": ApiResponse<User[]>;
  "/user/{id}": ApiResponse<User>;
  "/user/": ApiResponse<UpdateProfileResponse>;
  
  // 反馈
  "/feedback": ApiResponse<Feedback[]>;
  "/feedback/{id}": ApiResponse<Feedback>;
};
