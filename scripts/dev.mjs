// Local development: API (tsx, auto-restart) on :8787 and Vite on :5173, which proxies /api.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".env") && process.loadEnvFile) process.loadEnvFile(".env");
const env = { ...process.env, NODE_ENV: "development" };
const procs = [
  spawn("npx", ["tsx", "watch", "server/dev.ts"], { stdio: "inherit", env }),
  spawn("npx", ["vite"], { stdio: "inherit", env }),
];
const stop = () => procs.forEach((p) => p.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
procs.forEach((p) => p.on("exit", (code) => code && (stop(), process.exit(code))));
