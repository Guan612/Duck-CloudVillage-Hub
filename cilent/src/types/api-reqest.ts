export interface LoginParams {
  loginId: string;
  password: string;
}

export interface RegisterParams {
  loginId: string;
  password: string;
  nickname: string;
  avatarUrl?: string;
  // 如果有其他必填项在这里加，比如 avatarUrl?
}

export interface AddToCartParams {
  productId: number;
  quantity: number;
}
