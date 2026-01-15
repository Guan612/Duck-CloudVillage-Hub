import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import api from "./routers";
import { i18n } from "./middleware/i18n";

const app = new Hono();

app.use("*", cors()).use(logger()).use("*", i18n).route("/api", api);

export default app;
