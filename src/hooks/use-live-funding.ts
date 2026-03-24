import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface FundingItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export function useLiveFunding() {
  return useQuery<FundingItem[]>({
    queryKey: ["live-funding"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/funding");
      if (!res.ok) throw new Error(`Funding feed failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.funding,
    staleTime: 30_000,
  });
}
