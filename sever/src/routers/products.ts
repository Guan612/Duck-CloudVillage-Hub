import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { products } from "../db/schema";
import { insertProductSchema, updateProductSchema } from "../validators";
import { fail, success } from "../utils/result";

// 1. 初始化实例
const productsRouter = new OpenAPIHono();

// 2. JWT 中间件保持不变
productsRouter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// --- 路由定义 ---

const listProductsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取商品列表",
  security: [{ Bearer: [] }], // 声明需要 JWT 认证
  responses: {
    200: { description: "商品列表" },
  },
});

productsRouter.openapi(listProductsRoute, async (c) => {
  const res = await db.query.products.findMany({
    columns: { id: true, name: true, price: true, quantity: true },
  });
  return c.json(success(res), 200);
});

const getProductRoute = createRoute({
  method: "get",
  path: "/{id}", // 注意：OpenAPI 使用 {id} 格式
  summary: "获取商品详情",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "商品详情" },
  },
});

productsRouter.openapi(getProductRoute, async (c) => {
  const { id } = c.req.valid("param"); // 自动获取验证过的参数
  const res = await db.query.products.findFirst({
    where: eq(products.id, Number(id)),
  });
  return c.json(success(res), 200);
});

const createProductRoute = createRoute({
  security: [{ Bearer: [] }],
  method: "post",
  path: "/",
  summary: "创建商品",
  request: {
    body: {
      content: { "application/json": { schema: insertProductSchema } },
    },
  },
  responses: {
    200: { description: "创建成功" },
    400: { description: "参数错误" },
  },
});

productsRouter.openapi(createProductRoute, async (c) => {
  const data = c.req.valid("json"); // 自动获取验证过的 body
  const res = await db.insert(products).values(data);
  return c.json(success(res), 200);
});

const updateProductRoute = createRoute({
  security: [{ Bearer: [] }],
  method: "patch",
  path: "/{id}",
  summary: "更新商品",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: { "application/json": { schema: updateProductSchema } },
    },
  },
  responses: {
    200: { description: "更新成功" },
    400: { description: "参数错误" },
  },
});

productsRouter.openapi(updateProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  const res = await db
    .update(products)
    .set(data)
    .where(eq(products.id, Number(id)));

  return c.json(success(res), 200);
});

export default productsRouter;
