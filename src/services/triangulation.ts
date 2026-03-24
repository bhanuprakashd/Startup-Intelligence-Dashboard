import type { Signal, SignalCategory } from "./orchestrator";

export interface TriangulationResult {
  readonly overallScore: number;
  readonly scores: {
    readonly demand: number;
    readonly competition: number;
    readonly innovation: number;
    readonly community: number;
  };
  readonly signalCount: number;
  readonly categoriesCovered: number;
  readonly confidence: "high" | "medium" | "low";
  readonly signals: readonly Signal[];
}

function avgStrength(signals: Signal[]): number {
  if (signals.length === 0) return 0;
  return signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;
}

function freshnessScore(signals: Signal[]): number {
  if (signals.length === 0) return 0;
  const now = Date.now();

  const scores = signals.map((s) => {
    const age = now - new Date(s.fetchedAt).getTime();
    const days = age / (1000 * 60 * 60 * 24);
    if (days < 7) return 1.0;
    if (days < 30) return 0.7;
    if (days < 90) return 0.4;
    return 0.1;
  });

  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export function triangulate(signals: Signal[]): TriangulationResult {
  const categories = new Set(signals.map((s) => s.category));
  const categoriesCovered = categories.size;

  // Group signals by category
  const byCategory: Record<SignalCategory, Signal[]> = {
    demand: signals.filter((s) => s.category === "demand"),
    competition: signals.filter((s) => s.category === "competition"),
    innovation: signals.filter((s) => s.category === "innovation"),
    community: signals.filter((s) => s.category === "community"),
  };

  // Per-category scores (0-100)
  const demandScore = Math.round(avgStrength(byCategory.demand) * 100);
  // Competition: invert — fewer/weaker competitors = higher score
  const rawCompetition = avgStrength(byCategory.competition);
  const competitionScore = Math.round((1 - rawCompetition * 0.5) * 100);
  const innovationScore = Math.round(avgStrength(byCategory.innovation) * 100);
  const communityScore = Math.round(avgStrength(byCategory.community) * 100);

  // Overall confidence score using the formula from spec
  const signalCountWeight = 30;
  const signalStrengthWeight = 30;
  const recencyWeight = 20;
  const diversityWeight = 20;

  const overallScore = Math.round(
    signalCountWeight * Math.min(signals.length / 5, 1.0) +
      signalStrengthWeight * avgStrength(signals) +
      recencyWeight * freshnessScore(signals) +
      diversityWeight * (categoriesCovered / 4)
  );

  const confidence: "high" | "medium" | "low" =
    overallScore >= 70 ? "high" : overallScore >= 40 ? "medium" : "low";

  return {
    overallScore: Math.min(overallScore, 100),
    scores: {
      demand: demandScore,
      competition: competitionScore,
      innovation: innovationScore,
      community: communityScore,
    },
    signalCount: signals.length,
    categoriesCovered,
    confidence,
    signals,
  };
}
