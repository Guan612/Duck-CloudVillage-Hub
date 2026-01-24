import { relations } from "drizzle-orm";
import {
  text,
  integer,
  pgTable,
  timestamp,
  varchar,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    loginId: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    nickname: varchar({ length: 255 }),
    avatarUrl: varchar({ length: 255 }),
    role: integer().default(0).notNull(), //0 普通用户，1 村委工作人员，2 村长
    balance: integer().default(0),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (table) => [index("role_idx").on(table.role)],
);

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    price: integer().notNull(),
    imgUrl: varchar({ length: 255 }),
    quantity: integer().notNull().default(0),
    category: varchar("category", { length: 50 }), // 增加分类（如：农产品、旅游服务）
    status: integer().notNull().default(0), //0 下架，1 上架，2 采购中
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (table) => [
    index("name_idx").on(table.name),
    index("status_category_idx").on(table.status, table.category),
    index("price_idx").on(table.price),
  ],
);

export const carts = pgTable("carts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId")
    .references(() => users.id)
    .notNull(),
  productId: integer("productId")
    .references(() => products.id)
    .notNull(),
  checked: boolean("checked").default(true), // 是否选中（方便计算总价）
  quantity: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const orders = pgTable(
  "orders",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("userId")
      .references(() => users.id)
      .notNull(),
    totalPrice: integer().notNull(),
    orderNo: varchar("orderNo", { length: 64 }).notNull().unique(), // 业务订单号，不暴露 id
    status: integer().notNull().default(0), //0 未支付，1 已支付 2 已发货，3 已收货
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    uniqueIndex("order_no_idx").on(table.orderNo),
    index("status_idx").on(table.status),
    index("created_at_idx").on(table.createdAt),
  ],
);

export const orderList = pgTable(
  "oderList",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer("orderId")
      .references(() => orders.id)
      .notNull(),
    productId: integer("productId")
      .references(() => products.id)
      .notNull(),
    quantity: integer().notNull(),
    unitPrice: integer().notNull(),
    totalPrice: integer().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
  },
  (table) => [index("order_id_idx").on(table.orderId)],
);

export const articles = pgTable("articles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  userId: integer("userId")
    .references(() => users.id)
    .notNull(),
  coverUrl: varchar({ length: 255 }), // 封面图
  mediaUrl: varchar({ length: 255 }),
  readTime: timestamp(),
  pointsReward: integer().notNull().default(0),
  isPublished: boolean("is_published").default(false), // 是否发布
  publishedAt: timestamp("published_at"), // 发布时间
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const feedbacks = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  giver: integer("giver") //反馈人
    .references(() => users.id)
    .notNull(),
  charge: integer("charge") //负责人
    .references(() => users.id),
  status: integer().notNull().default(0), //0 提出反馈，1 接待反馈，2 已处理，3 关闭反馈
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  articles: many(articles),
  feedbacks: many(feedbacks),
  carts: many(carts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderList),
}));

export const orderListRelations = relations(orderList, ({ one }) => ({
  order: one(orders, {
    fields: [orderList.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderList.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  // one 表示一条购物车记录对应一个产品
  product: one(products, {
    fields: [carts.productId], // 当前表的外键列
    references: [products.id], // 关联目标表的主键列
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  carts: many(carts),
}));
