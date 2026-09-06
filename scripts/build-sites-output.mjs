import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/server", { recursive: true });
cpSync("apps/portal/out", "dist/client", { recursive: true });
cpSync("apps/portal/sites-worker.mjs", "dist/server/index.js");
