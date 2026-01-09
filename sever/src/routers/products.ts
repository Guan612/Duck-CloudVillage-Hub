import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { products } from "../db/schema";
import { insertProductSchema } from "../validators";
import z from "zod";

const productsRotter = new Hono();

productsRotter.use(
  jwt({
    secret: appConfig.jwt.secret,
  }),
);

productsRotter.get("/", async (c) => {
  const res = await db.query.products.findMany();
  return c.json(res);
});

productsRotter.get("/:id", async (c) => {
  const productId = c.req.param("id");
  const res = await db.query.products.findFirst({
    where: eq(products.id, Number(productId)),
  });
  return c.json(res);
});

productsRotter.post("/", async (c) => {
  const body = await c.req.json();
  const req = insertProductSchema.safeParse(body);
  if (!req.success) {
    return c.json({ error: z.flattenError(req.error) }, 400);
  }



});


export default productsRotter