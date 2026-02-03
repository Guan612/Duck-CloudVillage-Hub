import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "us-east-1", // 必填；RustFS一般不严格依赖 region
  endpoint: process.env.OSS_ENDPOINT!, // ⭐ RustFS 的 S3 端点
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY!,
    secretAccessKey: process.env.RUSTFS_SECRET_KEY!,
  },
  forcePathStyle: true, // ⭐ RustFS/多数兼容服务推荐开启
});
