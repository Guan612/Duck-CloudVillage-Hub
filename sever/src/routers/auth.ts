import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  insertUserSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";
import { createTokens } from "../utils/token";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { verify } from "hono/jwt";
import { appConfig } from "../config";

const authRouter = new OpenAPIHono();

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "用户登录",
  request: {
    body: {
      content: {
        "application/json": { schema: loginSchema },
      },
    },
  },
  responses: {
    200: { description: "登录成功" },
    401: { description: "认证失败" },
    400: { description: "参数错误" },
  },
});

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  summary: "用户注册",
  request: {
    body: {
      content: {
        "application/json": { schema: insertUserSchema },
      },
    },
  },
  responses: {
    200: { description: "注册成功" },
    409: { description: "用户已存在" },
  },
});

authRouter.openapi(loginRoute, async (c) => {
  // 注意：使用 zod-openapi 后，可以通过 c.req.valid('json') 获取已验证的数据
  const data = c.req.valid("json");
  const t = await useTranslation(c);

  const user = await db.query.users.findFirst({
    where: eq(users.loginId, data.loginId),
  });

  if (!user) {
    return c.json(fail(t("auth.err.login")), 401);
  }

  const isMatch = await Bun.password.verify(data.password, user.password);
  if (!isMatch) {
    return c.json(fail(t("auth.err.login")), 401);
  }

  const tokens = await createTokens(user);
  return c.json(
    success(
      {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          loginId: user.loginId,
          nickname: user.nickname,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      t("auth.success.login_success"),
    ),
    200,
  );
});

authRouter.openapi(registerRoute, async (c) => {
  const data = c.req.valid("json");
  const t = await useTranslation(c);

  const isUser = await db.query.users.findFirst({
    where: eq(users.loginId, data.loginId),
  });

  if (isUser) {
    return c.json(fail(t("auth.err.user_exit")), 409);
  }

  const hashedPassword = await Bun.password.hash(data.password);

  const [newUser] = await db
    .insert(users)
    .values({
      ...data,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      loginId: users.loginId,
      nickname: users.nickname,
      role: users.role,
      createdAt: users.createdAt,
    });

  return c.json(success(newUser), 200);
});

const refreshTokenRoute = createRoute({
  method: "post",
  path: "/refresh",
  summary: "刷新token",
  responses: {
    200: { description: "刷新成功" },
    401: { description: "刷新失败" },
  },
  request: {
    body: {
      content: { "application/json": { schema: refreshTokenSchema } },
    },
  },
});

authRouter.openapi(refreshTokenRoute, async (c) => {
  const t = await useTranslation(c);
  const { refreshToken } = c.req.valid("json");

  try {
    // 2. 验证 Refresh Token 的合法性 (签名 + 过期时间)
    // 如果过期或被篡改，verify 会直接抛出异常，进入 catch
    const payload = await verify(refreshToken, appConfig.jwt.refresh_secret);

    // 3. 安全检查 (非常重要！)
    // 确保这个 Token 是 refresh 类型，防止用户拿 access token 来这里捣乱
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const userId = payload.userId as number;

    // 4. (可选但推荐) 查一下数据库，确保用户没被封号
    const res = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!res) {
      return c.json(fail(t("auth.err.user_exit")), 401);
    }

    const role = res.role;

    // 5. 🔥 核心：生成新的 Token 对 (滑动过期策略)
    // 这里我们重新生成了一对 Token，包括新的 Refresh Token
    // 这样只要用户在用，Refresh Token 的 7 天有效期就会不断重置
    const newTokens = await createTokens({ id: userId, role });

    return c.json(success(newTokens), 200);
  } catch (e) {
    console.error("刷新失败", e);
    // 验证失败，返回 401，前端 Http 类会捕获这个错误并执行 handleLogout
    return c.json(fail(t("errors")), 401);
  }
});

export default authRouter;
