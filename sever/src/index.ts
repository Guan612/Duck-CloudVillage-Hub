import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import api from "./routers";

const app = new Hono();

app
  .use("*", cors())
  .use(logger())
  .use(
    languageDetector({
      supportedLanguages: ["cn", "bo"], // Must include fallback
      fallbackLanguage: "cn", // Required
    }),
  )
  .route("/api", api);

export default app;
