import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { products } from "../db/schema";
import { insertProductSchema, updateProductSchema } from "../validators";
import { fail, success } from "../utils/result";

// 1. 初始化主路由实例 (公共路由挂载在这里)
const productsRouter = new OpenAPIHono();

// 2. 初始化受保护的子路由实例
const protectedRouter = new OpenAPIHono();

// 3. 仅对受保护的子路由应用 JWT 中间件
protectedRouter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// --- 路由定义 ---

// [Public] 列表接口 - 移除了 security 字段
const listProductsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取商品列表",
  responses: {
    200: { description: "商品列表" },
  },
});

productsRouter.openapi(listProductsRoute, async (c) => {
  const res = await db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      price: true,
      quantity: true,
      imgUrl: true,
      category: true,
    },
  });
  return c.json(success(res), 200);
});

// [Public] 详情接口 - 移除了 security 字段
const getProductRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取商品详情",
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
  const { id } = c.req.valid("param");
  const res = await db.query.products.findFirst({
    where: eq(products.id, Number(id)),
  });
  return c.json(success(res), 200);
});

// --- 以下是受保护的路由 ---

const createProductRoute = createRoute({
  security: [{ Bearer: [] }], // ✅ 保留 security，文档会显示需要锁
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

// 🔥 注意：挂载到 protectedRouter
protectedRouter.openapi(createProductRoute, async (c) => {
  const data = c.req.valid("json");
  const res = await db.insert(products).values(data);
  return c.json(success(res), 200);
});

const updateProductRoute = createRoute({
  security: [{ Bearer: [] }], // ✅ 保留 security
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

// 🔥 注意：挂载到 protectedRouter
protectedRouter.openapi(updateProductRoute, async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  const res = await db
    .update(products)
    .set(data)
    .where(eq(products.id, Number(id)));

  return c.json(success(res), 200);
});

// 4. 最后一步：将受保护的路由合并回主路由
// 这样访问 /api/products/ (POST) 时，请求会流向 protectedRouter 并触发 JWT
productsRouter.route("/", protectedRouter);

export default productsRouter;
