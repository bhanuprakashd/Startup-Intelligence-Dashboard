import { cacheGet, cacheSet } from "./cache";

export type SourceStatus = "up" | "down" | "circuit_open";

export interface SourceHealth {
  readonly name: string;
  readonly status: SourceStatus;
  readonly lastChecked: string;
  readonly consecutiveFailures: number;
}

const CIRCUIT_OPEN_THRESHOLD = 3;

export async function reportSourceUp(sourceId: string): Promise<void> {
  await cacheSet(
    `source:${sourceId}:health`,
    { name: sourceId, status: "up", lastChecked: new Date().toISOString(), consecutiveFailures: 0 },
    300
  );
}

export async function reportSourceDown(sourceId: string): Promise<void> {
  const current = await cacheGet<SourceHealth>(`source:${sourceId}:health`);
  const failures = (current?.consecutiveFailures ?? 0) + 1;
  const status: SourceStatus = failures >= CIRCUIT_OPEN_THRESHOLD ? "circuit_open" : "down";
  const ttl = status === "circuit_open" ? 900 : 60;

  await cacheSet(
    `source:${sourceId}:health`,
    { name: sourceId, status, lastChecked: new Date().toISOString(), consecutiveFailures: failures },
    ttl
  );
}

export async function isSourceAvailable(sourceId: string): Promise<boolean> {
  const health = await cacheGet<SourceHealth>(`source:${sourceId}:health`);
  return health?.status !== "circuit_open";
}

export async function getAllSourceHealth(): Promise<Record<string, SourceHealth>> {
  const sourceIds = ["newsdata", "hackernews", "rss_techcrunch"];
  const results: Record<string, SourceHealth> = {};

  for (const id of sourceIds) {
    const health = await cacheGet<SourceHealth>(`source:${id}:health`);
    results[id] = health ?? {
      name: id,
      status: "up",
      lastChecked: new Date().toISOString(),
      consecutiveFailures: 0,
    };
  }

  return results;
}
