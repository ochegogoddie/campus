import { spawn } from "node:child_process";
import path from "node:path";
import { loadProjectEnv, projectRoot } from "./load-project-env.mjs";

loadProjectEnv();

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const args = process.argv.slice(2);

const child = spawn(process.execPath, [nextBin, ...args], {
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
  console.error("Failed to start Next.js command:", error);
  process.exit(1);
});
