import cn from "../locales/cn"
type ResourceSchema = typeof cn;

// 2. 扩展 @intlify/hono 的模块定义
declare module "@intlify/hono" {
  // 将 DefineLocaleMessage 接口继承你的 JSON 结构
  export interface DefineLocaleMessage extends ResourceSchema {}
}