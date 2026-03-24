"use client";

import { Bot, Sparkles } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export function ChatPanel({ isOpen, onToggle }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const ts = Date.now();
      const userMsg: Message = {
        id: `user-${ts}`,
        role: "user",
        content: text,
      };

      const assistantMsg: Message = {
        id: `asst-${ts}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: "",
      };

      setInput("");
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      try {
        abortRef.current = new AbortController();

        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errorText = await res.text();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `Error: ${res.status} — ${errorText.slice(0, 200)}` }
                : m
            )
          );
          setIsLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: "Error: No response stream" }
                : m
            )
          );
          setIsLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: fullText } : m
            )
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `Error: ${err instanceof Error ? err.message : "Unknown error"}` }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-l border-white/5 bg-[#0d0d14] transition-all duration-300",
        isOpen ? "w-[380px] max-w-[calc(100vw-48px)]" : "w-0 overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-[12px] font-semibold">WSI Copilot</h3>
          <p className="text-micro text-muted-foreground">
            AI startup intelligence assistant
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-3xs font-medium text-emerald-400">LIVE</span>
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h4 className="mt-4 text-sm font-semibold">
              Startup Intelligence at your fingertips
            </h4>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Ask about market opportunities, validate ideas, analyze
              competitors, or explore trending sectors.
            </p>
            <div className="mt-4 w-full space-y-2">
              {[
                "What are the hottest startup sectors right now?",
                "I want to build an AI tool for small businesses",
                "Compare fintech markets in India vs Southeast Asia",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left text-2xs text-muted-foreground transition-colors hover:border-indigo-500/20 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.02]">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Bot className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Thinking...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </aside>
  );
}
