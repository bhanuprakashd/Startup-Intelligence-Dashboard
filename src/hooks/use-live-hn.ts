import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface HNItem {
  id: string;
  title: string;
  url: string;
  source: string;
  score: number;
  author: string;
  comments: number;
  publishedAt: string;
  hnUrl: string;
}

export function useLiveHN() {
  return useQuery<HNItem[]>({
    queryKey: ["live-hn"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/hackernews");
      if (!res.ok) throw new Error(`HN feed failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: 60_000,
  });
}
