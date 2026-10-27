import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { missingConfig } from "../lib/env.js";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let database = "ok";
  try {
    await db.execute(sql`select 1`);
  } catch {
    database = "down";
  }
  const ok = database === "ok" && missingConfig.length === 0;
  res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "needs setup", database, missingConfig });
});

export default router;
