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
  jsonb,
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
  imageUrls: jsonb(), // 存储图片URL数组（JSON字符串）
  lastRemindedAt: timestamp("lastRemindedAt"), // 上次提醒时间
  remindCount: integer().default(0), // 提醒次数
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  articles: many(articles),
  feedbacks: many(feedbacks),
  carts: many(carts),
  feedbackLikes: many(feedbackLikes),
  feedbackComments: many(feedbackComments),
  feedbackReplies: many(feedbackReplies),
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

// 反馈点赞表
export const feedbackLikes = pgTable("feedback_likes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  feedbackId: integer("feedbackId")
    .references(() => feedbacks.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => [
  uniqueIndex("feedback_user_like_idx").on(table.feedbackId, table.userId),
]);

// 反馈评论表（用户评论）
export const feedbackComments = pgTable("feedback_comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  feedbackId: integer("feedbackId")
    .references(() => feedbacks.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

// 官方回复表（管理员回复）
export const feedbackReplies = pgTable("feedback_replies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  feedbackId: integer("feedbackId")
    .references(() => feedbacks.id, { onDelete: "cascade" })
    .notNull(),
  replierId: integer("replierId") // 回复人（管理员）
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

// 反馈点赞关系
export const feedbackLikesRelations = relations(feedbackLikes, ({ one }) => ({
  feedback: one(feedbacks, {
    fields: [feedbackLikes.feedbackId],
    references: [feedbacks.id],
  }),
  user: one(users, {
    fields: [feedbackLikes.userId],
    references: [users.id],
  }),
}));

// 反馈评论关系
export const feedbackCommentsRelations = relations(feedbackComments, ({ one }) => ({
  feedback: one(feedbacks, {
    fields: [feedbackComments.feedbackId],
    references: [feedbacks.id],
  }),
  user: one(users, {
    fields: [feedbackComments.userId],
    references: [users.id],
  }),
}));

// 官方回复关系
export const feedbackRepliesRelations = relations(feedbackReplies, ({ one }) => ({
  feedback: one(feedbacks, {
    fields: [feedbackReplies.feedbackId],
    references: [feedbacks.id],
  }),
  replier: one(users, {
    fields: [feedbackReplies.replierId],
    references: [users.id],
  }),
}));

// 反馈关系
export const feedbacksRelations = relations(feedbacks, ({ one, many }) => ({
  giverUser: one(users, {
    fields: [feedbacks.giver],
    references: [users.id],
  }),
  chargeUser: one(users, {
    fields: [feedbacks.charge],
    references: [users.id],
  }),
  likes: many(feedbackLikes),
  comments: many(feedbackComments),
  replies: many(feedbackReplies),
}));
