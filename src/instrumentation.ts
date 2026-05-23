/** Runs once when the Next.js server starts — ensures .env.local / .env.example are loaded. */
export async function register() {
  const { loadOasisEnv } = await import("@/lib/load-env");
  loadOasisEnv();
}
