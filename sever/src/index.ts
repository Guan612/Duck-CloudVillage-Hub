import { logger } from "hono/logger";
import { cors } from "hono/cors";
import api from "./routers"; // 你的路由汇聚文件
import { i18n } from "./middleware/i18n";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference"; // 推荐使用 Scalar UI

const app = new OpenAPIHono();

// 1. 中间件
app.use("*", cors());
app.use(logger());
app.use("*", i18n);

// 2. 挂载所有路由
// 这一步会将 api 里的所有 OpenAPI 定义合并到 app 中
const routes = app.route("/api", api);

// 3. 🔥 关键：配置 OpenAPI JSON 文档地址
// 只有写了这行，访问 /doc 才会返回 JSON 数据
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "云上乡村 API 文档",
    description: "基于 Tauri + Hono + OpenAPI 的全栈接口",
  },
});

// 4. 🔥 关键：配置可视化界面
// 访问 http://localhost:3000/ui 即可看到文档
app.get(
  "/ui",
  Scalar({
    url: "/doc", // ✅ 直接指定 JSON 文档地址
    theme: "purple", // 🎨 可选主题: 'purple', 'moon', 'solarized', 'default'
    pageTitle: "云上乡村 API Reference", // 📝 自定义页面标题
  }),
);

// 5. 导出类型给前端使用
export type AppType = typeof routes;

export default app;
