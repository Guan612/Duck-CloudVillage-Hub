import { Hono } from "hono";
import { sign } from "hono/jwt";
import { insertUserSchema, loginSchema, users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { appConfig } from "../config";

const authRouter = new Hono();

authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const req = loginSchema.safeParse(body);

  if (!req.success) {
    return c.json({ error: req.error }, 400);
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.loginId, req.data.loginId))
    .execute();

  if (user.length === 0) {
    return c.json({ error: "用户名或密码错误" }, 401);
  }

  const isMatch = await Bun.password.verify(
    req.data.password,
    user[0].password,
  );

  if (!isMatch) {
    return c.json({ error: "用户名或密码错误" }, 400);
  }

  const payload = {
    sub: user[0].id, // Subject: 用户ID (标准字段)
    role: user[0].role, // Role: 存入角色，方便前端和后端中间件判断权限
    name: user[0].nickname, // 可选：存入昵称，前端解析后可直接显示
    exp: Math.floor(Date.now() / 1000) + appConfig.jwt.expiresIn,
  };

  const token = await sign(payload, appConfig.jwt.secret);

  return c.json({
    token: token,
    user: {
      id: user[0].id,
      loginId: user[0].loginId,
      nickname: user[0].nickname,
      role: user[0].role,
      avatarUrl: user[0].avatarUrl,
    },
  });
});

authRouter.post("/register", async (c) => {
  const body = await c.req.json();

  const req = insertUserSchema.safeParse(body);

  if (!req.success) {
    return c.json({ error: req.error }, 400);
  }

  const isUser = await db
    .select()
    .from(users)
    .where(eq(users.loginId, req.data.loginId));

  if (isUser.length > 0) {
    return c.json({ error: "用户已经注册" }, 409);
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
