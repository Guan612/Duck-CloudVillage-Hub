import { Context, Hono } from "hono";
import { success } from "../utils/result";
import { useTranslation } from "@intlify/hono";

const tests = new Hono();

tests.get("/", async (c) => {
  const t = await useTranslation(c);
  const msg = t("welcome", { name: "John" });
  return c.text(msg);
});

export default tests;
