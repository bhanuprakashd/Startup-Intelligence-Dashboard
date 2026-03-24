import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
}

export function useLiveNews() {
  return useQuery<NewsItem[]>({
    queryKey: ["live-news"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/news");
      if (!res.ok) throw new Error(`News feed failed: ${res.status}`);
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: 60_000,
  });
}
