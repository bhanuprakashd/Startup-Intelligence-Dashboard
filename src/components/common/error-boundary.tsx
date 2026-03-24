"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  readonly children: ReactNode;
  readonly fallback?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{this.props.fallback ?? "Something went wrong. Please refresh."}</span>
        </div>
      );
    }
    return this.props.children;
  }
}
