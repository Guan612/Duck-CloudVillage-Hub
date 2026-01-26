import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { feedbackComments, feedbacks, users } from "../db/schema";
import { fail, success } from "../utils/result";

const feedbackCommentsRouter = new OpenAPIHono();

feedbackCommentsRouter.use(
  "*",
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 获取反馈的评论列表
const getCommentsRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取反馈的评论列表",
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

feedbackCommentsRouter.openapi(getCommentsRoute, async (c) => {
  const { id } = c.req.valid("param");

  // 检查反馈是否存在
  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  // 获取评论列表
  const comments = await db.query.feedbackComments.findMany({
    where: eq(feedbackComments.feedbackId, Number(id)),
    orderBy: (feedbackComments, { desc }) => [desc(feedbackComments.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json(success(comments), 200);
});

// 创建评论
const createCommentRoute = createRoute({
  method: "post",
  path: "/{id}",
  summary: "创建评论",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            content: z.string().min(1, "评论内容不能为空"),
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

feedbackCommentsRouter.openapi(createCommentRoute, async (c) => {
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

  // 创建评论
  const [newComment] = await db
    .insert(feedbackComments)
    .values({
      feedbackId: Number(id),
      userId: userId,
      content: data.content,
    })
    .returning();

  return c.json(success(newComment), 200);
});

// 删除评论
const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/{commentId}",
  summary: "删除评论",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      commentId: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "删除成功" },
    404: { description: "评论不存在" },
  },
});

feedbackCommentsRouter.openapi(deleteCommentRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { commentId } = c.req.valid("param");

  // 检查评论是否存在且属于当前用户
  const comment = await db.query.feedbackComments.findFirst({
    where: eq(feedbackComments.id, Number(commentId)),
  });

  if (!comment) {
    return c.json(fail("评论不存在"), 404);
  }

  // 只能删除自己的评论
  if (comment.userId !== userId) {
    return c.json(fail("无权删除此评论"), 403);
  }

  // 删除评论
  await db
    .delete(feedbackComments)
    .where(eq(feedbackComments.id, Number(commentId)));

  return c.json(success(null, "删除成功"), 200);
});

export default feedbackCommentsRouter;
