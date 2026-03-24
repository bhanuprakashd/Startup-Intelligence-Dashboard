"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { type FormEvent } from "react";

interface ChatInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (e: FormEvent) => void;
  readonly isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-white/5 p-3">
      <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about markets, ideas, trends..."
          rows={1}
          className="max-h-32 min-h-[20px] flex-1 resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition-opacity disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
        Try: &quot;What sectors are growing fastest?&quot; or &quot;Validate my SaaS idea&quot;
      </p>
    </form>
  );
}
