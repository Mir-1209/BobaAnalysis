import express, { type Express } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { loadSession } from "./lib/session.js";
import { csrfGuard } from "./lib/security.js";
import { errorHandler } from "./lib/http.js";
import { missingConfig } from "./lib/env.js";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url?.split("?")[0]?.replace(/\/calendar\/[^/]+/, "/calendar/:key") }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: "same-origin" },
  }),
);
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(cookieParser());
// A guest import carries a whole progress snapshot; a few hundred KB at most.
app.use(express.json({ limit: "2mb" }));

// Misconfigured deploys answer with exactly what to fix, instead of crashing.
app.use("/api", (req, res, next) => {
  if (missingConfig.length === 0 || req.path === "/healthz") return next();
  res.status(503).json({ error: `Server isn't configured yet. Add in Vercel → Settings → Environment Variables: ${missingConfig.join(", ")}` });
});
app.use("/api", csrfGuard);
app.use("/api", loadSession);
app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use(errorHandler);

export default app;
