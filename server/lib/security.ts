import type { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import { HttpError } from "./http.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
// The app's own URL, plus this deployment's own Vercel URLs so Preview deployments work too.
const vercelHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map((h) => `https://${h}`);
const allowedOrigins = new Set([env.appUrl, ...vercelHosts, ...(env.isProd ? [] : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173"])]);

/**
 * CSRF defence in depth on top of SameSite=Lax cookies:
 * every state-changing request must carry our custom header (which forces a CORS
 * preflight that other origins can't pass) and, when the browser sends Origin, it must be ours.
 */
export function csrfGuard(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE.has(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !allowedOrigins.has(origin)) throw new HttpError(403, "Cross-site request blocked", "bad_origin");
  if (req.get("x-studycraft") !== "1") throw new HttpError(403, "Missing request header", "csrf");
  next();
}
