import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { success } from "../utils/result";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { insertCartSchema, updateCartSchema } from "../validators";
import { carts } from "../db/schema";

const cartRoter = new OpenAPIHono();

cartRoter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

const listUserCart = createRoute({
  summary: "获取用户购物车",
  security: [{ Bearer: [] }],
  method: "get",
  path: "/",
  responses: {
    200: { description: "成功获取用户购物车数据" },
  },
});

cartRoter.openapi(listUserCart, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;

  const res = await db.query.carts.findMany({
    where: eq(userId, userId),
  });
  return c.json(success(res));
});

const insertUserCart = createRoute({
  summary: "添加购物车",
  security: [{ Bearer: [] }],
  method: "post",
  path: "/",
  request: {
    body: {
      content: { "application/json": { schema: insertCartSchema } },
    },
  },
  responses: {
    200: { description: "添加成功" },
  },
});

cartRoter.openapi(insertUserCart, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const data = c.req.valid("json");
  const res = await db.insert(carts).values({ ...data, userId }).returning;
  return c.json(success(res));
});

const updateUserCart = createRoute({
  summary: "修改购物车数据",
  security: [{ Bearer: [] }],
  method: "post",
  path: "/",
  request: {
    body: {
      content: { "application/json": { schema: updateCartSchema } },
    },
  },
  responses: {
    200: { description: "成功获取购物车数据" },
  },
});

cartRoter.openapi(updateUserCart, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const data = c.req.valid("json");

  const res = await db.update(carts).set(data).where(eq(carts.userId, userId));

  return c.json(success(res));
});

const deletUserCart = createRoute({
  summary: "删除购物车数据",
  security: [{ Bearer: [] }],
  method: "delete",
  path: "/{id}",
  responses: {
    200: { description: "成功删除" },
  },
});

export default cartRoter;
