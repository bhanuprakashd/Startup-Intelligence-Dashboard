export const INDUSTRIES = [
  { id: "ai", name: "Artificial Intelligence", color: "#8B5CF6" },
  { id: "fintech", name: "FinTech", color: "#10B981" },
  { id: "healthtech", name: "HealthTech", color: "#EF4444" },
  { id: "cleantech", name: "CleanTech", color: "#22C55E" },
  { id: "edtech", name: "EdTech", color: "#F59E0B" },
  { id: "ecommerce", name: "E-Commerce", color: "#EC4899" },
  { id: "saas", name: "SaaS", color: "#3B82F6" },
  { id: "biotech", name: "BioTech", color: "#14B8A6" },
  { id: "cybersecurity", name: "Cybersecurity", color: "#6366F1" },
  { id: "proptech", name: "PropTech", color: "#F97316" },
  { id: "agritech", name: "AgriTech", color: "#84CC16" },
  { id: "logistics", name: "Logistics", color: "#06B6D4" },
  { id: "spacetech", name: "SpaceTech", color: "#A855F7" },
  { id: "gaming", name: "Gaming", color: "#E11D48" },
  { id: "web3", name: "Web3 / Blockchain", color: "#F472B6" },
  { id: "robotics", name: "Robotics", color: "#0EA5E9" },
  { id: "other", name: "Other", color: "#6B7280" },
] as const;

export const FUNDING_STAGES = [
  { id: "pre-seed", name: "Pre-Seed", order: 0 },
  { id: "seed", name: "Seed", order: 1 },
  { id: "series-a", name: "Series A", order: 2 },
  { id: "series-b", name: "Series B", order: 3 },
  { id: "series-c", name: "Series C", order: 4 },
  { id: "series-d", name: "Series D", order: 5 },
  { id: "series-e", name: "Series E+", order: 6 },
  { id: "growth", name: "Growth", order: 7 },
  { id: "ipo", name: "IPO", order: 8 },
  { id: "undisclosed", name: "Undisclosed", order: 9 },
] as const;

export const REGIONS = [
  { id: "na", name: "North America", countries: ["US", "CA", "MX"] },
  { id: "eu", name: "Europe", countries: ["GB", "DE", "FR", "NL", "SE", "ES", "IT", "CH", "IE"] },
  { id: "asia", name: "Asia", countries: ["CN", "IN", "JP", "KR", "SG", "ID", "TH", "VN"] },
  { id: "latam", name: "Latin America", countries: ["BR", "AR", "CL", "CO", "MX"] },
  { id: "mena", name: "MENA", countries: ["AE", "SA", "IL", "EG", "TR"] },
  { id: "africa", name: "Africa", countries: ["NG", "KE", "ZA", "EG", "GH", "RW"] },
  { id: "oceania", name: "Oceania", countries: ["AU", "NZ"] },
] as const;

export const REFRESH_INTERVALS = {
  funding: 60_000,
  news: 120_000,
  ecosystems: 300_000,
  industries: 600_000,
  startups: 600_000,
} as const;

export const STALE_TIMES = {
  funding: 30_000,
  news: 60_000,
  ecosystems: 150_000,
  industries: 300_000,
  startups: 300_000,
} as const;

export const DATA_SOURCES = [
  { id: "growjo", name: "Growjo", status: "active" as const },
  { id: "fundingdb", name: "Startup Funding DB", status: "active" as const },
  { id: "startupblink", name: "StartupBlink", status: "active" as const },
  { id: "newsdata", name: "NewsData.io", status: "active" as const },
] as const;

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
