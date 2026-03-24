import { useMutation } from "@tanstack/react-query";

export interface ValidationResult {
  idea: string;
  overallScore: number;
  confidence: "high" | "medium" | "low";
  scores: {
    demand: number;
    competition: number;
    innovation: number;
    community: number;
  };
  signalCount: number;
  sourcesQueried: number;
  sourcesSucceeded: number;
  categoriesCovered: number;
  aiAnalysis: string;
  signals: {
    category: string;
    source: string;
    description: string;
    strength: number;
    url: string;
  }[];
}

export function useValidateIdea() {
  return useMutation<ValidationResult, Error, string>({
    mutationFn: async (idea: string) => {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Validation failed");
      }

      const json = await res.json();
      return json.data;
    },
  });
}
