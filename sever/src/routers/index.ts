import { Hono } from "hono";
import authRouter from "./auth";
import userRouter from "./users";

const api = new Hono()

api.route("/auth", authRouter);
api.route("/user", userRouter);

export default api