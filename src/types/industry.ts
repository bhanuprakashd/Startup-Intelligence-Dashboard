export interface IndustrySector {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly startupCount: number;
  readonly totalFunding: number;
  readonly avgDealSize: number;
  readonly growthRate: number;
  readonly topCountries: readonly string[];
  readonly recentDeals: number;
  readonly color: string;
}

export interface MarketTrend {
  readonly period: string;
  readonly industry: string;
  readonly dealCount: number;
  readonly totalFunding: number;
  readonly avgDealSize: number;
}
