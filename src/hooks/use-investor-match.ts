import { useMutation } from "@tanstack/react-query";

export interface InvestorMatchInput {
  idea: string;
  sector?: string;
  stage?: string;
  location?: string;
}

export interface InvestorMatchResult {
  idea: string;
  sector: string;
  stage: string;
  location: string;
  aiAnalysis: string;
  sourcesQueried: number;
  sourcesSucceeded: number;
}

export function useInvestorMatch() {
  return useMutation<InvestorMatchResult, Error, InvestorMatchInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Investor match failed");
      }

      const json = await res.json();
      return json.data;
    },
  });
}
