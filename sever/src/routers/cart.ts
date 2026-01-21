import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { fail, success } from "../utils/result";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { insertCartSchema, updateCartSchema } from "../validators";
import { carts } from "../db/schema";
import { useTranslation } from "@intlify/hono";

const cartRoter = new OpenAPIHono();

cartRoter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

const listUserCartRouter = createRoute({
  summary: "获取用户购物车",
  security: [{ Bearer: [] }],
  method: "get",
  path: "/",
  responses: {
    200: { description: "成功获取用户购物车数据" },
  },
});

cartRoter.openapi(listUserCartRouter, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;

  const res = await db.query.carts.findMany({
    where: eq(carts.userId, userId),
  });
  return c.json(success(res));
});

const insertUserCartRouter = createRoute({
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

cartRoter.openapi(insertUserCartRouter, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const data = c.req.valid("json");
  const res = await db.insert(carts).values({ ...data, userId }).returning;
  return c.json(success(res));
});

const updateUserCartRouter = createRoute({
  summary: "修改购物车数据",
  security: [{ Bearer: [] }],
  method: "post",
  path: "/{id}",
  request: {
    body: {
      content: { "application/json": { schema: updateCartSchema } },
    },
  },
  responses: {
    200: { description: "成功修改购物车数据" },
    404: { description: "没有找到购物车数据" },
  },
});

cartRoter.openapi(updateUserCartRouter, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const cartId = c.req.param("id");
  const data = c.req.valid("json");

  const res = await db
    .update(carts)
    .set(data)
    .where(eq(carts.userId, userId) && eq(carts.id, Number(cartId)));

  return c.json(success(res));
});

const deletUserCartRouter = createRoute({
  summary: "删除购物车数据",
  security: [{ Bearer: [] }],
  method: "delete",
  path: "/{id}",
  responses: {
    200: { description: "成功删除" },
  },
});

cartRoter.openapi(deletUserCartRouter, async (c) => {
  const t = await useTranslation(c);
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const cartId = c.req.param("id");

  const res = await db
    .delete(carts)
    .where(eq(carts.id, Number(cartId)) && eq(carts.userId, userId))
    .returning;

  if (!res) {
    return c.json(fail(t("param_error")), 404);
  }

  return c.json(success(res));
});

export default cartRoter;
