import { spawn } from "node:child_process";
import path from "node:path";
import { loadProjectEnv, projectRoot } from "./load-project-env.mjs";

loadProjectEnv();

const prismaBin = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const args = process.argv.slice(2);

const child = spawn(process.execPath, [prismaBin, ...args], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to start Prisma command:", error);
  process.exit(1);
});
