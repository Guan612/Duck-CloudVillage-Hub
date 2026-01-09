import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwt, verify } from "hono/jwt";
import { appConfig } from "../config";

const userRouter = new Hono();

userRouter.use(
  jwt({
    secret: appConfig.jwt.secret,
  }),
);

userRouter.get("/", async (c) => {
  const res = await db.query.users.findMany();
  return c.json(res);
});

userRouter.get("/:id", async (c) => {
  const userid = c.req.param("id");
  const res = await db.query.users.findFirst({
    where: eq(users.id, Number(userid)),
  });
  return c.json(res);
});

export default userRouter;
