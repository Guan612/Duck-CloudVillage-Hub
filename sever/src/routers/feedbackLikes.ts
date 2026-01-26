import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { feedbackLikes, feedbacks } from "../db/schema";
import { fail, success } from "../utils/result";

const feedbackLikesRouter = new OpenAPIHono();

feedbackLikesRouter.use(
  "*",
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 点赞反馈
const likeFeedbackRoute = createRoute({
  method: "post",
  path: "/{id}",
  summary: "点赞反馈",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "点赞成功" },
    400: { description: "已点赞" },
    404: { description: "反馈不存在" },
  },
});

feedbackLikesRouter.openapi(likeFeedbackRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  // 检查反馈是否存在
  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  // 检查是否已点赞
  const existingLike = await db.query.feedbackLikes.findFirst({
    where: and(
      eq(feedbackLikes.feedbackId, Number(id)),
      eq(feedbackLikes.userId, userId),
    ),
  });

  if (existingLike) {
    return c.json(fail("已经点赞过了"), 400);
  }

  // 创建点赞记录
  await db.insert(feedbackLikes).values({
    feedbackId: Number(id),
    userId: userId,
  });

  return c.json(success(null, "点赞成功"), 200);
});

// 取消点赞
const unlikeFeedbackRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "取消点赞",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "取消成功" },
    404: { description: "反馈不存在" },
  },
});

feedbackLikesRouter.openapi(unlikeFeedbackRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  // 检查反馈是否存在
  const feedback = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, Number(id)),
  });

  if (!feedback) {
    return c.json(fail("反馈不存在"), 404);
  }

  // 删除点赞记录
  await db
    .delete(feedbackLikes)
    .where(
      and(
        eq(feedbackLikes.feedbackId, Number(id)),
        eq(feedbackLikes.userId, userId),
      ),
    );

  return c.json(success(null, "取消点赞成功"), 200);
});

// 检查是否已点赞
const checkLikeRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "检查是否已点赞",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "获取成功" },
  },
});

feedbackLikesRouter.openapi(checkLikeRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  // 检查是否已点赞
  const like = await db.query.feedbackLikes.findFirst({
    where: and(
      eq(feedbackLikes.feedbackId, Number(id)),
      eq(feedbackLikes.userId, userId),
    ),
  });

  return c.json(success({ isLiked: !!like }), 200);
});

export default feedbackLikesRouter;
