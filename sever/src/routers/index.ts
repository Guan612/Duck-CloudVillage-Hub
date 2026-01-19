import authRouter from "./auth";
import userRouter from "./users";
import productsRotter from "./products";
import tests from "./tests";
import { OpenAPIHono } from "@hono/zod-openapi";

const api = new OpenAPIHono();

api.route("/auth", authRouter);
api.route("/user", userRouter);
api.route("/product", productsRotter);
api.route("/test", tests);

export default api;
