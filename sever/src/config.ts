export const appConfig = {
  jwt: {
    access_secret:
      process.env.JWT_ACCESS_SECRET || "default_secret_dont_use_in_prod",
    refresh_secret: process.env.JWT_REFRESH_SECRET || "default_secret_d",
    // 统一在这里处理类型转换
    access_expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN || 120000), // 2小时
    refresh_expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN || 604800),
  },
  server: {
    port: Number(process.env.PORT || 3000),
  },
};
