import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwt, verify } from "hono/jwt";
import { appConfig } from "../config";
import { updateUsersSchema } from "../validators";
import z from "zod";

const userRouter = new Hono();

userRouter.use(
  jwt({
    secret: appConfig.jwt.secret,
  }),
);

userRouter.get("/", async (c) => {
  const res = await db.query.users.findMany({
    columns: {
      id: true,
      loginId: true,
      nickname: true,
      avatarUrl: true,
      role: true,
      balance: true,
      createdAt: true,
      updatedAt: true,
      // 没写 password，它就不会被查出来
    },
  });
  return c.json(res);
});

userRouter.get("/:id", async (c) => {
  const userid = c.req.param("id");
  const res = await db.query.users.findFirst({
    where: eq(users.id, Number(userid)),
    columns: {
      id: true,
      loginId: true,
      nickname: true,
      avatarUrl: true,
      role: true,
      balance: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return c.json(res);
});

userRouter.patch("/", async (c) => {
  const payload = c.get("jwtPayload");
  const { userId } = payload;
  const body = await c.req.json();
  const req = updateUsersSchema.safeParse(body);
  if (!req.success) {
    return c.json({ error: z.flattenError(req.error) }, 400);
  }

  const data = req.data;

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, Number(userId)),
  });

  if (!currentUser) {
    return c.json({ error: "用户不存在" }, 404);
  }

  const updatePayload: any = {};

  //修改密码的逻辑
  if (data.newPassword) {
    if (!data.oldPassword) {
      return c.json({ error: "修改密码需要提供旧密码" }, 400);
    }

    const isOldPwdValid = await Bun.password.verify(
      data.oldPassword,
      currentUser.password,
    );

    if (!isOldPwdValid) {
      return c.json({ error: "旧密码错误" }, 403);
    }

    updatePayload.password = await Bun.password.hash(data.newPassword);
  }

  if (data.nickname) updatePayload.nickname = data.nickname;
  if (data.avatarUrl) updatePayload.avatarUrl = data.avatarUrl;

  // 6. 如果没有任何字段需要更新，直接返回
  if (Object.keys(updatePayload).length === 0) {
    return c.json({ message: "没有检测到需要修改的数据" });
  }

  // 7. 执行数据库更新
  const res = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, Number(userId)))
    .returning({
      id: users.id,
      loginId: users.loginId,
      nickname: users.nickname,
      updatedAt: users.updatedAt,
    });

  return c.json(res[0]);
});

export default userRouter;
