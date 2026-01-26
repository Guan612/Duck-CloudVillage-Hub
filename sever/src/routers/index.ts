import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./auth";
import userRouter from "./users";
import productsRotter from "./products";
import tests from "./tests";
import cartRoter from "./cart";
import ordersRouter from "./orders";
import feedbacksRouter from "./feedbacks";
import uploadRouter from "./upload";
import feedbackLikesRouter from "./feedbackLikes";
import feedbackCommentsRouter from "./feedbackComments";
import feedbackRepliesRouter from "./feedbackReplies";

const api = new OpenAPIHono();

api.route("/auth", authRouter);
api.route("/user", userRouter);
api.route("/product", productsRotter);
api.route("/cart", cartRoter);
api.route("/order", ordersRouter);
api.route("/feedback", feedbacksRouter);
api.route("/upload", uploadRouter);
api.route("/feedback/likes", feedbackLikesRouter);
api.route("/feedback/comments", feedbackCommentsRouter);
api.route("/feedback/replies", feedbackRepliesRouter);
api.route("/test", tests);

export default api;
