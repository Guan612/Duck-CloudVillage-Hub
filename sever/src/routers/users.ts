import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { updateUsersSchema } from "../validators";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";
import { requireRole, Role } from "../middleware/role";

// 1. 初始化 OpenAPIHono
// 可以通过 Variables 类型定义 JWT Payload 的类型安全
const userRouter = new OpenAPIHono();

// 2. 注册 JWT 中间件
userRouter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取用户列表",
  security: [{ Bearer: [] }], // 声明需要 JWT 认证
  responses: {
    200: { description: "成功获取用户列表" },
    401: { description: "token过期" },
    403: { description: "权限不足" },
  },
});

userRouter.openapi(listUsersRoute, requireRole([Role.ADMIN]), async (c) => {
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
    },
  });
  return c.json(success(res), 200);
});

const getUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取指定用户信息",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "获取成功" },
    404: { description: "用户不存在" },
  },
});

userRouter.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await db.query.users.findFirst({
    where: eq(users.id, Number(id)),
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
  return c.json(success(res), 200);
});

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/",
  summary: "修改个人资料/密码",
  request: {
    body: {
      content: {
        "application/json": { schema: updateUsersSchema },
      },
    },
  },
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "修改成功" },
    400: { description: "参数错误" },
    403: { description: "验证失败" },
    404: { description: "用户不存在" },
  },
});

userRouter.openapi(updateProfileRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const t = await useTranslation(c);
  const data = c.req.valid("json");

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, Number(userId)),
  });

  if (!currentUser) {
    return c.json(fail("用户不存在"), 404);
  }

  const updatePayload: any = {};

  // 修改密码逻辑
  if (data.newPassword) {
    if (!data.oldPassword) {
      return c.json(fail("修改密码需要提供旧密码"), 400);
    }

    const isOldPwdValid = await Bun.password.verify(
      data.oldPassword,
      currentUser.password,
    );

    if (!isOldPwdValid) {
      return c.json(fail("旧密码错误"), 403);
    }

    updatePayload.password = await Bun.password.hash(data.newPassword);
  }

  if (data.nickname) updatePayload.nickname = data.nickname;
  if (data.avatarUrl) updatePayload.avatarUrl = data.avatarUrl;

  if (Object.keys(updatePayload).length === 0) {
    return c.json(success(null, "没有检测到需要修改的数据"), 200);
  }

  const [updatedUser] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, Number(userId)))
    .returning({
      id: users.id,
      loginId: users.loginId,
      nickname: users.nickname,
      updatedAt: users.updatedAt,
    });

  return c.json(success(updatedUser), 200);
});

export default userRouter;
