export const appConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default_secret_dont_use_in_prod",
    // 统一在这里处理类型转换
    expiresIn: Number(process.env.JWT_EXPIRES_IN || 604800),
  },
  server: {
    port: Number(process.env.PORT || 3000),
  },
};
