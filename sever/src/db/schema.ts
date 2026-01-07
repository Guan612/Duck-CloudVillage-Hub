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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

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

// =========================================
// 1. Users (用户)
// =========================================

// 用于数据库查询返回的数据类型
export const selectUserSchema = createSelectSchema(users);

// 用于注册或创建用户的校验 (剔除自动生成的字段)
export const insertUserSchema = createInsertSchema(users, {
  loginId: (schema) =>
    schema.min(3, "账号至少需要3个字符").max(20, "账号不能超过20个字符"),
  password: (schema) => schema.min(6, "密码至少需要6位"),
  nickname: (schema) => schema.max(20, "昵称过长"),
  avatarUrl: (schema) => schema.url("头像必须是合法的URL"),
  role: (schema) => schema.int().min(0).max(2), // 限制角色范围 0-2
  balance: (schema) => schema.int().nonnegative("余额不能为负数"),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// 用于登录接口的校验 (只需要账号密码)
export const loginSchema = z.object({
  loginId: z.string().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码"),
});

// =========================================
// 2. Products (商品)
// =========================================

export const selectProductSchema = createSelectSchema(products);

export const insertProductSchema = createInsertSchema(products, {
  name: (schema) => schema.min(1, "商品名称不能为空"),
  price: (schema) => schema.int().positive("价格必须大于0"), // 价格必须是正整数
  quantity: (schema) => schema.int().nonnegative("库存不能为负数"),
  imgUrl: (schema) => schema.url().optional().or(z.literal("")), // 允许空字符串或URL
  status: (schema) => schema.int().min(0).max(2), // 0, 1, 2
}).omit({
  createdAt: true,
  updatedAt: true,
});

// =========================================
// 3. Carts (购物车)
// =========================================

export const selectCartSchema = createSelectSchema(carts);

export const insertCartSchema = createInsertSchema(carts, {
  quantity: (schema) => schema.int().positive("数量必须大于0"),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// =========================================
// 4. Orders (订单)
// =========================================

export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderSchema = createInsertSchema(orders, {
  totalPrice: (schema) => schema.int().nonnegative(),
  status: (schema) => schema.int().min(0).max(3),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// =========================================
// 5. OrderList (订单详情)
// =========================================

export const selectOrderListSchema = createSelectSchema(orderList);

export const insertOrderListSchema = createInsertSchema(orderList, {
  quantity: (schema) => schema.int().positive(),
  unitPrice: (schema) => schema.int().nonnegative(),
  totalPrice: (schema) => schema.int().nonnegative(),
}).omit({
  createdAt: true,
  updatedAt: true,
});

// =========================================
// 6. Articles (文章/资讯)
// =========================================

export const selectArticleSchema = createSelectSchema(articles);

export const insertArticleSchema = createInsertSchema(articles, {
  title: (schema) => schema.min(1, "标题不能为空").max(100),
  pointsReward: (schema) => schema.int().nonnegative().default(0),
  coverUrl: (schema) => schema.url().optional().or(z.literal("")),
}).omit({
  createdAt: true,
  updatedAt: true,
  readTime: true, // 阅读时间通常由后端记录，不通过接口传递
});

// =========================================
// 7. Feedbacks (反馈)
// =========================================

export const selectFeedbackSchema = createSelectSchema(feedbacks);

export const insertFeedbackSchema = createInsertSchema(feedbacks, {
  title: (schema) => schema.min(1, "标题不能为空"),
  content: (schema) => schema.min(10, "反馈内容太少，请详细描述"),
}).omit({
  charge: true, // 创建反馈时，还没有负责人，所以剔除该字段
  status: true, // 创建时默认为 0，不需要传
  createdAt: true,
  updatedAt: true,
});

// =========================================
// 8. Patch Schemas (用于更新接口)
// =========================================
// 如果你需要做 "修改个人资料" 或 "修改商品" 的接口，
// 通常需要 partial()，因为更新时不需要传所有字段。

export const patchUserSchema = insertUserSchema.partial();
export const patchProductSchema = insertProductSchema.partial();
