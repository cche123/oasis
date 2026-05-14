"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <path d="M2 12c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" />
      <path d="M2 17c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" opacity="0.4" />
      <path d="M2 7c1.5-3 3.5-5 6-5s4 2 6 5 3.5 5 6 5" opacity="0.4" />
    </svg>
  );
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      content: "I am Oasis. Ask me anything.",
    },
  ]);

  // Hide on landing and onboarding pages
  if (pathname === "/" || pathname === "/onboarding") {
    return null;
  }

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      const responseContent = "Based on recent signal flow, I recommend checking the 'Japan Tourism & Weak Yen' brief for structural context.";
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: responseContent },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Wave Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 shadow-lg",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <WaveIcon className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[380px] h-[30rem] bg-card border border-border rounded-3xl flex flex-col z-50 transition-all duration-500 origin-bottom-right shadow-2xl overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
              <WaveIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-medium text-foreground text-sm tracking-wide">Oasis</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans bg-background">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-2xl rounded-br-sm"
                    : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
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
              placeholder="Ask anything..."
              className="flex-1 bg-muted text-foreground rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
