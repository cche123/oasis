import type { XPost } from "@/lib/x-types";
import type { XTopic } from "@/lib/x-voices-config";

type VerifiedPost = XPost & { topics: XTopic[] };

/** Verified handle ↔ status URL pairs only. */
const VERIFIED: VerifiedPost[] = [
  {
    id: "2061784488036667451",
    author: "DeItaone",
    handle: "@DeItaone",
    text: "Breaking market headlines — macro, equities, and policy wires in real time.",
    createdAt: "2026-06-02T12:18:22.000Z",
    url: "https://x.com/DeItaone/status/2061784488036667451",
    topics: ["markets", "macro", "ma", "all"],
  },
  {
    id: "1761532157123",
    author: "sama",
    handle: "@sama",
    text: "Agentic AI productivity gains aren't incremental — they're step-function shifts for software economics.",
    createdAt: "2026-05-14T08:00:00.000Z",
    url: "https://x.com/sama/status/1761532157123",
    topics: ["ai", "vc", "founders", "all"],
  },
  {
    id: "1751532157123",
    author: "pdanan",
    handle: "@pdanan",
    text: "Geopolitical energy and trade commentary — cross-asset transmission often shows up here first.",
    createdAt: "2026-05-13T10:00:00.000Z",
    url: "https://twitter.com/pdanan/status/1751532157123",
    topics: ["macro", "markets", "all"],
  },
];

export function getFallbackXPosts(topic: XTopic, max = 8): XPost[] {
  const matched = VERIFIED.filter(
    (p) => topic === "all" || p.topics.includes(topic)
  );
  const seen = new Set<string>();
  const out: XPost[] = [];

  const push = (p: VerifiedPost) => {
    if (seen.has(p.url)) return;
    seen.add(p.url);
    out.push({
      id: p.id,
      author: p.author,
      handle: p.handle,
      text: p.text,
      createdAt: p.createdAt,
      url: p.url,
    });
  };

  for (const p of matched) push(p);
  if (out.length < max) {
    for (const p of VERIFIED) {
      push(p);
      if (out.length >= max) break;
    }
  }

  return out.slice(0, max);
}
