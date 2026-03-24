import { useQuery } from "@tanstack/react-query";

interface SourceHealthData {
  sources: Record<string, { status: string; lastChecked: string }>;
  summary: { total: number; up: number; down: number };
}

export function useSourceHealth() {
  return useQuery<SourceHealthData>({
    queryKey: ["source-health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? { sources: {}, summary: { total: 0, up: 0, down: 0 } };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
