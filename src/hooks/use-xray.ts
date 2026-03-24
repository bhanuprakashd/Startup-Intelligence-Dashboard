import { useMutation } from "@tanstack/react-query";

export interface XRayCompetitor {
  name: string;
  source: string;
  description: string;
  url: string;
}

export interface XRayResult {
  idea: string;
  aiAnalysis: string;
  competitors: XRayCompetitor[];
  sourcesQueried: number;
  sourcesSucceeded: number;
}

export function useXRay() {
  return useMutation<XRayResult, Error, string>({
    mutationFn: async (idea: string) => {
      const res = await fetch("/api/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "X-Ray analysis failed");
      }

      const json = await res.json();
      return json.data;
    },
  });
}
