/**
 * 统一 API 响应结构
 */
export interface ApiResponse<T = any> {
  code: number; // 0: 成功, 1: 失败 (也可以是其他业务错误码)
  msg: string; // 简要信息
  data?: T; // 具体数据 (失败时通常为空)
}
