import { Hono } from "hono";
import { sign } from "hono/jwt";
import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { appConfig } from "../config";
import { insertUserSchema, loginSchema } from "../validators";
import z from "zod";
import { fail, success } from "../utils/result";
import { Msg } from "../utils/msg";

const authRouter = new Hono();

authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const req = loginSchema.safeParse(body);

  if (!req.success) {
    return c.json(fail(Msg.PARAM_ERROR, z.flattenError(req.error)), 400);
  }
  const user = await db.query.users.findFirst({
    where: eq(users.loginId, req.data.loginId),
  });

  if (!user) {
    return c.json(fail(Msg.LOGIN_ERROR), 401);
  }

  const isMatch = await Bun.password.verify(req.data.password, user.password);

  if (!isMatch) {
    return c.json(fail(Msg.LOGIN_ERROR), 400);
  }

  const payload = {
    userId: user.id, // Subject: 用户ID (标准字段)
    loginId: user.loginId,
    role: user.role, // Role: 存入角色，方便前端和后端中间件判断权限
    name: user.nickname, // 可选：存入昵称，前端解析后可直接显示
    exp: Math.floor(Date.now() / 1000) + appConfig.jwt.expiresIn,
  };

  const token = await sign(payload, appConfig.jwt.secret);

  return c.json(
    success("登录成功", {
      token: token,
      user: {
        id: user.id,
        loginId: user.loginId,
        nickname: user.nickname,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    }),
  );
});

authRouter.post("/register", async (c) => {
  const body = await c.req.json();

  const req = insertUserSchema.safeParse(body);

  if (!req.success) {
    return c.json(fail(Msg.PARAM_ERROR, z.flattenError(req.error)), 400);
  }

  const isUser = await db.query.users.findFirst({
    where: eq(users.loginId, req.data.loginId),
  });

  if (isUser) {
    return c.json(fail("用户已经存在，请登录"), 409);
  }

  const hashedPassword = await Bun.password.hash(req.data.password);

  const newUser = await db
    .insert(users)
    .values({
      ...req.data, // 1. 展开 Zod 验证通过的所有字段
      password: hashedPassword, // 2. 用加密后的密码覆盖掉原密码
    })
    .returning({
      // 3. 显式指定返回哪些字段 (千万别返回密码!)
      id: users.id,
      loginId: users.loginId,
      nickname: users.nickname,
      role: users.role,
      createdAt: users.createdAt,
    });

  return c.json(newUser);
});

export default authRouter;
