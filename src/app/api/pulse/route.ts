import { NextResponse } from "next/server";
import { buildPulseNarratives } from "@/lib/pulse-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const interests = searchParams.get("interests")?.split("|").filter(Boolean) || [];
  const location = searchParams.get("location") || "";
  const country = searchParams.get("country") || "";
  const region = searchParams.get("region") || "";
  const lang = searchParams.get("lang") || "";

  const newsQs = new URLSearchParams();
  if (interests.length) newsQs.set("interests", interests.join("|"));
  if (location) newsQs.set("location", location);
  if (country) newsQs.set("country", country);
  if (region) newsQs.set("region", region);
  if (lang) newsQs.set("lang", lang);

  const origin = new URL(req.url).origin;
  let signals: Array<{
    title: string;
    summary: string;
    sourceUrl: string;
    source: string;
    category: string;
    date: string;
    publishedAt?: string;
  }> = [];

  try {
    const newsRes = await fetch(`${origin}/api/news?${newsQs.toString()}`, {
      cache: "no-store",
    });
    if (newsRes.ok) {
      const data = await newsRes.json();
      signals = data.signals || [];
    }
  } catch {
    /* empty */
  }

  const narratives = buildPulseNarratives(signals);

  return NextResponse.json({
    narratives,
    date: new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    timestamp: new Date().toISOString(),
  });
}
