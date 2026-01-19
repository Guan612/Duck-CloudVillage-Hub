import { type MiddlewareHandler } from "hono";
import { fail } from "../utils/result";
import { useTranslation } from "@intlify/hono";

export enum Role {
  VILLAGER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

// 2. 显式定义返回类型为 MiddlewareHandler
export const requireRole = (requiredRoles: Role[]): MiddlewareHandler => {
  // 3. 移除 createMiddleware 包裹，直接返回 async 函数
  return async (c, next) => {
    const t = await useTranslation(c);

    // 注意：如果是 OpenAPIHono，建议加个 ? 判空，防止未经过 jwt 中间件时报错
    const payload = c.get("jwtPayload");

    if (!payload) {
      return c.json(fail(t("auth.err.token")), 401);
    }

    const currentRole = Number(payload.role);

    if (!requiredRoles.includes(currentRole)) {
      return c.json(fail(t("auth.err.permisson")), 403);
    }

    await next();
  };
};
