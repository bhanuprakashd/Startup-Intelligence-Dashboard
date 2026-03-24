export interface Startup {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly industry: string;
  readonly subIndustry?: string;
  readonly website?: string;
  readonly logo?: string;
  readonly founded?: number;
  readonly headquarters: {
    readonly city: string;
    readonly country: string;
    readonly countryCode: string;
  };
  readonly funding: {
    readonly totalRaised: number;
    readonly lastRound?: FundingRound;
    readonly stage: FundingStage;
  };
  readonly metrics: {
    readonly employees?: number;
    readonly revenue?: number;
    readonly growthRate?: number;
    readonly valuation?: number;
  };
  readonly tags: readonly string[];
  readonly source: string;
  readonly updatedAt: string;
}

export interface FundingRound {
  readonly id: string;
  readonly companyName: string;
  readonly companyLogo?: string;
  readonly amount: number;
  readonly currency: string;
  readonly stage: FundingStage;
  readonly date: string;
  readonly investors: readonly Investor[];
  readonly industry: string;
  readonly country: string;
  readonly countryCode: string;
  readonly source: string;
}

export interface Investor {
  readonly name: string;
  readonly type: "vc" | "angel" | "corporate" | "government" | "other";
  readonly website?: string;
}

export type FundingStage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c"
  | "series-d"
  | "series-e"
  | "growth"
  | "ipo"
  | "undisclosed";
