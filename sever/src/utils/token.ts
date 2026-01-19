import { sign } from "hono/jwt";
import { appConfig } from "../config";

export const createTokens = async (user: { id: number; role: number }) => {
  // 1. 生成 Access Token (短效：15分钟)
  // Payload 丰富，为了让后端不查表就能鉴权
  const accessToken = await sign(
    {
      sub: user.id, // Subject: 用户ID
      role: user.role, // 角色：存这里，中间件直接读
      type: "access", // 标记类型
      exp: Math.floor(Date.now() / 1000) + appConfig.jwt.access_expiresIn,
    },
    appConfig.jwt.access_secret,
  );

  // 2. 生成 Refresh Token (长效：7天)
  // Payload 极简，只存 ID 和 版本号(可选)
  const refreshToken = await sign(
    {
      sub: user.id,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + appConfig.jwt.refresh_expiresIn,
    },
    appConfig.jwt.refresh_secret,
  );

  return { accessToken, refreshToken };
};
