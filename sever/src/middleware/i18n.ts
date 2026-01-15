// src/middleware/i18n.ts
import { defineIntlifyMiddleware } from "@intlify/hono";

import cn from "../locales/cn";
import bo from "../locales/bo";

export const i18n = defineIntlifyMiddleware({
  locale: (c) => {
    // 1. 优先检查 URL 参数 ?lang=bo
    // 这里用了 ?. 链式判断，防止报错
    const queryLang = c.req.query("lang");

    // 如果 URL 参数里传了支持的语言，直接返回
    if (queryLang === "cn" || queryLang === "bo") {
      return queryLang;
    }

    // 2. 其次检查 Header (Accept-Language)
    // 浏览器通常发送 "zh-CN,zh;q=0.9,en;q=0.8"
    const headerLang = c.req.header("Accept-Language");

    if (headerLang) {
      // 如果包含 bo，返回藏文
      if (headerLang.includes("bo")) {
        return "bo";
      }
      // 如果包含 zh (zh-CN, zh-TW)，返回中文
      if (headerLang.includes("zh")) {
        return "cn";
      }
    }

    // 3. 最后的保底：默认返回中文
    return "cn";
  },

  messages: {
    cn,
    bo,
  },
});
