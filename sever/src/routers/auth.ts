import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { insertUserSchema, loginSchema } from "../validators";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";
import { createTokens } from "../utils/token";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

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
    return c.json(fail(t("auth.login_err")), 401);
  }

  const isMatch = await Bun.password.verify(data.password, user.password);
  if (!isMatch) {
    return c.json(fail(t("auth.login_err")), 401);
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
      t("auth.login_success"),
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
    return c.json(fail(t("auth.user_exit")), 409);
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

export default authRouter;
