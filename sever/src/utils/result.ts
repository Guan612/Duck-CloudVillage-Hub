// src/utils/result.ts

/**
 * 统一 API 响应结构
 */
export interface ApiResponse<T = any> {
  code: number; // 0: 成功, 1: 失败 (也可以是其他业务错误码)
  msg: string; // 简要信息
  data?: T; // 具体数据 (失败时通常为空)
}

/**
 * 成功响应 (code: 0)
 * @param data 返回的数据
 * @param msg 提示信息 (默认: "操作成功")
 */
export const success = <T>(
  data: T,
  msg: string = "操作成功",
): ApiResponse<T> => {
  return {
    code: 0,
    msg,
    data,
  };
};

/**
 * 失败响应 (code: 1)
 * @param msg 错误信息
 * @param data 额外的错误详情 (可选)
 * @param code 自定义错误码 (默认: 1)
 */
export const fail = (
  msg: string = "操作失败",
  data: any = null,
  code: number = 1,
): ApiResponse => {
  return {
    code,
    msg,
    data,
  };
};
