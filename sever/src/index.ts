import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import api from "./routers";

const app = new Hono();

app.use("*", cors()).use(logger()).route("/api", api);

export default app;
