import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { fail, success } from "../utils/result";

const uploadRouter = new OpenAPIHono();

uploadRouter.use(
  "*",
  jwt({
    secret: appConfig.jwt.access_secret,
  }),
);

// 上传配置
const uploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// 通用文件上传接口
const uploadRoute = createRoute({
  method: "post",
  path: "/",
  summary: "上传文件",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "上传成功" },
    400: { description: "参数错误" },
    413: { description: "文件过大" },
    415: { description: "不支持的文件类型" },
  },
});

uploadRouter.openapi(uploadRoute, async (c) => {
  const body = await c.req.parseBody();

  const file = body.file as File;

  if (!file) {
    return c.json(fail("请选择文件"), 400);
  }

  // 验证文件大小
  if (file.size > uploadConfig.maxSize) {
    return c.json(fail(`文件大小不能超过${uploadConfig.maxSize / 1024 / 1024}MB`), 413);
  }

  // 验证文件类型
  if (!uploadConfig.allowedTypes.includes(file.type)) {
    return c.json(fail("不支持的文件类型"), 415);
  }

  try {
    // 生成文件名（时间戳 + 随机字符串）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}_${randomStr}.${fileExt}`;

    // 创建uploads目录（如果不存在）
    const fs = require("fs");
    const path = require("path");
    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // 返回文件URL
    const fileUrl = `/uploads/${fileName}`;

    return c.json(
      success({
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
      200,
    );
  } catch (error) {
    console.error("[Upload] 文件上传失败:", error);
    return c.json(fail("文件上传失败"), 500);
  }
});

export default uploadRouter;
