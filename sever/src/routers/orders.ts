import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { orders, orderList, products } from "../db/schema";
import { insertOrderSchema, insertOrderListSchema } from "../validators";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";

const ordersRouter = new OpenAPIHono();

ordersRouter.use(
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 获取用户订单列表
const listOrdersRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取用户订单列表",
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      status: z.string().optional().openapi({ example: "0" }),
    }),
  },
  responses: {
    200: { description: "成功获取订单列表" },
  },
});

ordersRouter.openapi(listOrdersRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { status } = c.req.valid("query");

  const whereCondition = eq(orders.userId, userId);
  
  const res = await db.query.orders.findMany({
    where: status ? and(whereCondition, eq(orders.status, Number(status))) : whereCondition,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  return c.json(success(res), 200);
});

// 获取订单详情
const getOrderRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取订单详情",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "获取成功" },
    404: { description: "订单不存在" },
  },
});

ordersRouter.openapi(getOrderRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  const res = await db.query.orders.findFirst({
    where: and(eq(orders.id, Number(id)), eq(orders.userId, userId)),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!res) {
    return c.json(fail("订单不存在"), 404);
  }

  return c.json(success(res), 200);
});

// 创建订单
const createOrderRoute = createRoute({
  method: "post",
  path: "/",
  summary: "创建订单",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(
              z.object({
                productId: z.number(),
                quantity: z.number().positive(),
              })
            ),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "创建成功" },
    400: { description: "参数错误" },
  },
});

ordersRouter.openapi(createOrderRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const t = await useTranslation(c);
  const { items } = c.req.valid("json");

  if (!items || items.length === 0) {
    return c.json(fail("订单商品不能为空"), 400);
  }

  // 验证商品并计算总价
  let totalPrice = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });

    if (!product) {
      return c.json(fail(`商品 ID ${item.productId} 不存在`), 400);
    }

    if (product.quantity < item.quantity) {
      return c.json(fail(`商品 ${product.name} 库存不足`), 400);
    }

    const itemTotalPrice = product.price * item.quantity;
    totalPrice += itemTotalPrice;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: itemTotalPrice,
    });
  }

  // 生成订单号
  const orderNo = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8)}`;

  // 创建订单
  const [newOrder] = await db
    .insert(orders)
    .values({
      userId,
      totalPrice,
      orderNo,
      status: 0,
    })
    .returning();

  // 创建订单详情
  for (const item of orderItems) {
    await db.insert(orderList).values({
      orderId: newOrder.id,
      ...item,
    });

    // 扣减库存 - 先查询当前库存
    const currentProduct = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });
    
    if (currentProduct) {
      await db
        .update(products)
        .set({ quantity: currentProduct.quantity - item.quantity })
        .where(eq(products.id, item.productId));
    }
  }

  return c.json(success(newOrder), 200);
});

// 更新订单状态（支付、发货、收货）
const updateOrderStatusRoute = createRoute({
  method: "patch",
  path: "/{id}/status",
  summary: "更新订单状态",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.number().min(0).max(3),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "更新成功" },
    404: { description: "订单不存在" },
  },
});

ordersRouter.openapi(updateOrderStatusRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");
  const { status } = c.req.valid("json");

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, Number(id)), eq(orders.userId, userId)),
  });

  if (!order) {
    return c.json(fail("订单不存在"), 404);
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, Number(id)))
    .returning();

  return c.json(success(updatedOrder), 200);
});

// 删除订单
const deleteOrderRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除订单",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "删除成功" },
    404: { description: "订单不存在" },
  },
});

ordersRouter.openapi(deleteOrderRoute, async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.userId;
  const { id } = c.req.valid("param");

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, Number(id)), eq(orders.userId, userId)),
  });

  if (!order) {
    return c.json(fail("订单不存在"), 404);
  }

  // 只能删除未支付的订单
  if (order.status !== 0) {
    return c.json(fail("只能删除未支付的订单"), 400);
  }

  await db.delete(orders).where(eq(orders.id, Number(id)));

  return c.json(success(null, "订单已删除"), 200);
});

export default ordersRouter;
