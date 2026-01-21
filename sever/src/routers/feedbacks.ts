import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { feedbacks, users } from "../db/schema";
import { insertFeedbackSchema } from "../validators";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";
import { requireRole, Role } from "../middleware/role";

const feedbacksRouter = new OpenAPIHono();

feedbacksRouter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 获取反馈列表
const listFeedbacksRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取反馈列表",
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      status: z.string().optional().openapi({ example: "0" }),
    }),
  },
  responses: {
    200: { description: "成功获取反馈列表" },
  },
});

feedbacksRouter.openapi(listFeedbacksRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { status } = c.req.valid("query");

  const whereCondition = status 
    ? and(eq(feedbacks.giver, userId), eq(feedbacks.status, Number(status)))
    : eq(feedbacks.giver, userId);

  const res = await db.query.feedbacks.findMany({
    where: whereCondition,
    orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)],
    with: {
      giverUser: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
      chargeUser: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json(success(res), 200);
});

// 获取反馈详情
const getFeedbackRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取反馈详情",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "获取成功" },
    404: { description: "反馈不存在" },
  },
});

feedbacksRouter.openapi(getFeedbackRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  const res = await db.query.feedbacks.findFirst({
    where: and(eq(feedbacks.id, Number(id)), eq(feedbacks.giver, userId)),
    with: {
      giverUser: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
      chargeUser: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!res) {
    return c.json(fail("反馈不存在"), 404);
  }

  return c.json(success(res), 200);
});

// 创建反馈
const createFeedbackRoute = createRoute({
  method: "post",
  path: "/",
  summary: "创建反馈",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: { "application/json": { schema: insertFeedbackSchema } },
    },
  },
  responses: {
    200: { description: "创建成功" },
    400: { description: "参数错误" },
  },
});

feedbacksRouter.openapi(createFeedbackRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const data = c.req.valid("json");

  const [newFeedback] = await db
    .insert(feedbacks)
    .values({
      ...data,
      giver: userId,
      status: 0,
    })
    .returning();

  return c.json(success(newFeedback), 200);
});

// 更新反馈（分配负责人、更新状态）- 需要管理员权限
const updateFeedbackRoute = createRoute({
  method: "patch",
  path: "/{id}",
  summary: "更新反馈",
  security: [{ Bearer: [] }],
  middleware: requireRole([Role.ADMIN]),
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            charge: z.number().optional(),
            status: z.number().min(0).max(3).optional(),
            title: z.string().optional(),
            content: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "更新成功" },
    404: { description: "反馈不存在" },
  },
});

feedbacksRouter.openapi(updateFeedbackRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.content !== undefined) updatePayload.content = data.content;
  if (data.charge !== undefined) updatePayload.charge = data.charge;
  if (data.status !== undefined) updatePayload.status = data.status;

  const [updatedFeedback] = await db
    .update(feedbacks)
    .set(updatePayload)
    .where(eq(feedbacks.id, Number(id)))
    .returning();

  return c.json(success(updatedFeedback), 200);
});

// 删除反馈 - 需要管理员权限
const deleteFeedbackRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除反馈",
  security: [{ Bearer: [] }],
  middleware: requireRole([Role.ADMIN]),
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "删除成功" },
    404: { description: "反馈不存在" },
  },
});

feedbacksRouter.openapi(deleteFeedbackRoute, async (c) => {
  const { id } = c.req.valid("param");

  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  await db.delete(feedbacks).where(eq(feedbacks.id, Number(id)));

  return c.json(success(null, "反馈已删除"), 200);
});

export default feedbacksRouter;
