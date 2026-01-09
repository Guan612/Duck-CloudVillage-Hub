import { z } from "zod";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  articles,
  carts,
  feedbacks,
  orderList,
  orders,
  products,
  users,
} from "./db/schema";

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
  avatarUrl: (schema) => schema.min(3, "头像必须是合法的URL"),
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

// 更改用户信息
export const updateUsersSchema = createUpdateSchema(users, {
  // 1. 针对数据库里有的字段，在这里加规则
  nickname: (schema) => schema.max(20, "昵称太长了"),
})
  // 2. 剔除那些绝对不允许通过接口修改的敏感字段
  .omit({
    createdAt: true,
    updatedAt: true,
    role: true, // 防止普通用户把自己改成村长
    balance: true, // 防止用户自己改余额
    loginId: true,
  })
  // 3. 扩展：添加数据库里没有的字段
  .extend({
    newPassword: z.string().min(6, "密码需要大于6位").optional(),
    oldPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  // 4. 高级验证：处理密码逻辑
  .superRefine((data, ctx) => {
    // 只有当用户试图修改密码（传入了 password）时，才进行校验
    if (data.newPassword) {
      // 必须传旧密码
      if (!data.oldPassword) {
        ctx.addIssue({
          code: "custom",
          message: "修改密码必须提供旧密码",
          path: ["oldPassword"],
        });
      }

      // 必须传确认密码
      if (!data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "请确认新密码",
          path: ["confirmPassword"],
        });
      }

      // 新密码必须等于确认密码
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "两次输入的密码不一致",
          path: ["confirmPassword"],
        });
      }
    }
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
