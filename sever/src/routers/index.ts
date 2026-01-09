import { Hono } from "hono";
import authRouter from "./auth";
import userRouter from "./users";
import productsRotter from "./products";

const api = new Hono();

api.route("/auth", authRouter);
api.route("/user", userRouter);
api.route("/product", productsRotter);

export default api;
