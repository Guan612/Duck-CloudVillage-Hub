import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { appConfig } from "../config";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { products } from "../db/schema";
import { insertProductSchema, updateProductSchema } from "../validators";
import z from "zod";
import { fail, success } from "../utils/result";
import { useTranslation } from "@intlify/hono";

const productsRotter = new Hono();

productsRotter.use(
  jwt({
    secret: appConfig.jwt.secret,
  }),
);

productsRotter.get("/", async (c) => {
  const res = await db.query.products.findMany();
  return c.json(success(res));
});

productsRotter.get("/:id", async (c) => {
  const productId = c.req.param("id");
  const res = await db.query.products.findFirst({
    where: eq(products.id, Number(productId)),
  });
  return c.json(success(res));
});

productsRotter.post("/", async (c) => {
  const body = await c.req.json();
  const t = await useTranslation(c);
  const req = insertProductSchema.safeParse(body);
  if (!req.success) {
    return c.json(fail(t("param_error"), z.flattenError(req.error)), 400);
  }
  const res = await db.insert(products).values(req.data);

  return c.json(success(res));
});

productsRotter.patch("/:id", async (c) => {
  const productId = c.req.param("id");
  const t = await useTranslation(c);
  const body = await c.req.json();
  const req = updateProductSchema.safeParse(body);
  if (!req.success) {
    return c.json(fail(t("param_error"), z.flattenError(req.error)), 400);
  }
  const res = await db
    .update(products)
    .set(req.data)
    .where(eq(products.id, Number(productId)));

  return c.json(success(res));
});

export default productsRotter;
