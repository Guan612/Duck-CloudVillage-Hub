import { Hono } from "hono";
import { success } from "../utils/result";

const tests = new Hono();

tests.get("/", async (c) => {
  return c.json(success("到这了", { hellow: 123 }), 200);
});

export default tests;
