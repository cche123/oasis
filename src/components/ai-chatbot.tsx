"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUser } from "@/components/user-context";
import { resolveLocation } from "@/lib/locations";
import type { OasisFeedUpdate } from "@/lib/chat-types";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
    >
      <path d="M2 12c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" />
      <path d="M2 17c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" opacity="0.4" />
      <path d="M2 7c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" opacity="0.4" />
    </svg>
  );
}

function applyFeedUpdates(
  user: ReturnType<typeof useUser>["user"],
  updates: OasisFeedUpdate
): Partial<ReturnType<typeof useUser>["user"]> {
  const partial: Partial<ReturnType<typeof useUser>["user"]> = {};

  if (updates.addInterests?.length) {
    const merged = [...user.interests];
    for (const i of updates.addInterests) {
      if (!merged.some((x) => x.toLowerCase() === i.toLowerCase())) merged.push(i);
    }
    partial.interests = merged;
  }

  if (updates.removeInterests?.length) {
    partial.interests = user.interests.filter(
      (i) => !updates.removeInterests!.some((r) => r.toLowerCase() === i.toLowerCase())
    );
  }

  if (updates.addMarkets?.length) {
    const merged = [...user.internationalMarkets];
    for (const m of updates.addMarkets) {
      if (!merged.includes(m)) merged.push(m);
    }
    partial.internationalMarkets = merged;
  }

  if (updates.location) {
    const resolved = resolveLocation(updates.location);
    partial.location = updates.location;
    partial.resolvedLocation = resolved.valid ? resolved : undefined;
  }

  return partial;
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { user, updateUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      content:
        "I am Oasis. Ask me anything about markets — or tell me to personalize your feed (e.g. \"add AI roll-ups\" or \"focus on Japanese markets\").",
    },
  ]);

  if (pathname === "/" || pathname === "/onboarding") {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    const historyForApi = [...messages.filter((m) => m.id !== "init"), newMsg];
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          userContext: {
            name: user?.name,
            interests: user?.interests,
            location: user?.location,
            resolvedLocation: user?.resolvedLocation,
            internationalMarkets: user?.internationalMarkets,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.details || data.error || "Request failed";
        throw new Error(detail);
      }

      if (!data.text) {
        throw new Error("Empty response from AI");
      }

      if (data.updates) {
        const partial = applyFeedUpdates(user, data.updates as OasisFeedUpdate);
        if (Object.keys(partial).length > 0) {
          updateUser(partial);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.text || "No response generated.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const msg =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            msg.includes("GEMINI") || msg.includes("API key")
              ? "Oasis AI isn't configured on this server yet. The app owner needs to set GEMINI_API_KEY in the deployment environment."
              : `I couldn't reach the AI service right now. Please try again in a moment.${msg ? ` (${msg})` : ""}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 shadow-lg",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <WaveIcon className="w-6 h-6" />
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 w-[380px] h-[30rem] bg-card border border-border rounded-3xl flex flex-col z-50 transition-all duration-500 origin-bottom-right shadow-2xl overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
              <WaveIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-medium text-foreground text-sm tracking-wide">
                Oasis
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  )}
                />
                <span className="text-[10px] text-muted-foreground">
                  {isLoading ? "Thinking..." : "Online"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans bg-background">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-2xl rounded-br-sm"
                    : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything or personalize your feed..."
              className="flex-1 bg-muted text-foreground rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
