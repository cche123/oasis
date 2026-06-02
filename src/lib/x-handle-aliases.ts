export const X_HANDLE_ALIASES: Record<string, string> = {
  elon: "elonmusk",
  musk: "elonmusk",
  sam: "sama",
  altman: "sama",
  concept: "ConceptCrypt0",
  concepts: "ConceptCrypt0",
  deltaone: "DeItaone",
  "delta one": "DeItaone",
  whale: "unusual_whales",
  whales: "unusual_whales",
};

/**
 * Resolve common aliases into a canonical X handle (no leading "@").
 */
export function resolveXHandleAlias(handle: string): string {
  const h = handle.replace(/^@/, "").trim().toLowerCase();
  return X_HANDLE_ALIASES[h] ?? handle.replace(/^@/, "").trim();
}
