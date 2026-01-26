import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { feedbackReplies, feedbacks, users } from "../db/schema";
import { fail, success } from "../utils/result";
import { requireRole, Role } from "../middleware/role";

const feedbackRepliesRouter = new OpenAPIHono();

feedbackRepliesRouter.use(
  "*",
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 创建官方回复（需要管理员权限）
const createReplyRoute = createRoute({
  method: "post",
  path: "/{id}",
  summary: "创建官方回复",
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
            content: z.string().min(1, "回复内容不能为空"),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "创建成功" },
    400: { description: "参数错误" },
    404: { description: "反馈不存在" },
  },
});

feedbackRepliesRouter.openapi(createReplyRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  // 检查反馈是否存在
  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  // 创建官方回复
  const [newReply] = await db
    .insert(feedbackReplies)
    .values({
      feedbackId: Number(id),
      replierId: userId,
      content: data.content,
    })
    .returning();

  // 如果反馈状态为待处理，更新为处理中
  if (feedback.status === 0) {
    await db
      .update(feedbacks)
      .set({ status: 1 })
      .where(eq(feedbacks.id, Number(id)));
  }

  return c.json(success(newReply), 200);
});

// 更新官方回复（需要管理员权限）
const updateReplyRoute = createRoute({
  method: "patch",
  path: "/{replyId}",
  summary: "更新官方回复",
  security: [{ Bearer: [] }],
  middleware: requireRole([Role.ADMIN]),
  request: {
    params: z.object({
      replyId: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            content: z.string().min(1, "回复内容不能为空"),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "更新成功" },
    400: { description: "参数错误" },
    404: { description: "回复不存在" },
  },
});

feedbackRepliesRouter.openapi(updateReplyRoute, async (c) => {
  const { replyId } = c.req.valid("param");
  const data = c.req.valid("json");

  // 检查回复是否存在
  const reply = await db.query.feedbackReplies.findFirst({
    where: eq(feedbackReplies.id, Number(replyId)),
  });

  if (!reply) {
    return c.json(fail("回复不存在"), 404);
  }

  // 更新回复
  const [updatedReply] = await db
    .update(feedbackReplies)
    .set({ content: data.content })
    .where(eq(feedbackReplies.id, Number(replyId)))
    .returning();

  return c.json(success(updatedReply), 200);
});

// 删除官方回复（需要管理员权限）
const deleteReplyRoute = createRoute({
  method: "delete",
  path: "/{replyId}",
  summary: "删除官方回复",
  security: [{ Bearer: [] }],
  middleware: requireRole([Role.ADMIN]),
  request: {
    params: z.object({
      replyId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "删除成功" },
    404: { description: "回复不存在" },
  },
});

feedbackRepliesRouter.openapi(deleteReplyRoute, async (c) => {
  const { replyId } = c.req.valid("param");

  // 检查回复是否存在
  const reply = await db.query.feedbackReplies.findFirst({
    where: eq(feedbackReplies.id, Number(replyId)),
  });

  if (!reply) {
    return c.json(fail("回复不存在"), 404);
  }

  // 删除回复
  await db
    .delete(feedbackReplies)
    .where(eq(feedbackReplies.id, Number(replyId)));

  return c.json(success(null, "删除成功"), 200);
});

// 获取反馈的官方回复列表
const getRepliesRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取反馈的官方回复列表",
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

feedbackRepliesRouter.openapi(getRepliesRoute, async (c) => {
  const { id } = c.req.valid("param");

  // 检查反馈是否存在
  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  // 获取官方回复列表
  const replies = await db.query.feedbackReplies.findMany({
    where: eq(feedbackReplies.feedbackId, Number(id)),
    orderBy: (feedbackReplies, { desc }) => [desc(feedbackReplies.createdAt)],
    with: {
      replier: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json(success(replies), 200);
});

export default feedbackRepliesRouter;
