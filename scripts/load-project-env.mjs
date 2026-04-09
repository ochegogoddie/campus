import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptsDir, "..");
const envFilePath = path.join(projectRoot, ".env.gigs");

function parseEnvValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).replace(/\\n/g, "\n");
  }

  return value;
}

export function loadProjectEnv() {
  if (fs.existsSync(envFilePath)) {
    const fileContents = fs.readFileSync(envFilePath, "utf8");

    for (const line of fileContents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

      if (!match) {
        continue;
      }

      const [, key, rawValue] = match;
      process.env[key] = parseEnvValue(rawValue);
    }
  }

  if (!process.env.NEXTAUTH_URL && process.env.RENDER_EXTERNAL_URL) {
    process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL;
  }

  return process.env;
}
