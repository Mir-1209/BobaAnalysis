import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    throw new HttpError(400, `${where}${issue?.message ?? "Invalid input"}`, "invalid_input");
  }
  return result.data;
}

export function idParam(req: Request, name = "id"): number {
  const n = Number(req.params[name]);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Invalid id");
  return n;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }
  const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
  if (status && status >= 400 && status < 500) {
    res.status(status).json({ error: "Bad request" });
    return;
  }
  req.log?.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Something broke on our side. We're on it." });
}

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = "/home"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export function clientIp(req: Request): string {
  // Vercel sets x-forwarded-for; Express `trust proxy` is enabled so req.ip reads it.
  return req.ip ?? "unknown";
}
