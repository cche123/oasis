import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ENV_FILES = [".env.local", ".env.development.local", ".env", ".env.example"] as const;

let loaded = false;

/** Load env files into process.env (first file wins; does not override existing vars). */
export function loadOasisEnv(): void {
  if (loaded) return;
  loaded = true;

  const cwd = process.cwd();

  for (const filename of ENV_FILES) {
    const path = join(cwd, filename);
    if (!existsSync(path)) continue;

    try {
      const text = readFileSync(path, "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;

        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (key && value && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // skip unreadable file
    }
  }
}
