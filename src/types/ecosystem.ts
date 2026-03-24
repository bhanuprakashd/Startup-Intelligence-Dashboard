export interface EcosystemData {
  readonly country: string;
  readonly countryCode: string;
  readonly cities: readonly CityEcosystem[];
  readonly totalStartups: number;
  readonly totalFunding: number;
  readonly ecosystemScore: number;
  readonly rank: number;
}

export interface CityEcosystem {
  readonly city: string;
  readonly country: string;
  readonly countryCode: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly startupCount: number;
  readonly totalFunding: number;
  readonly ecosystemScore: number;
  readonly rank: number;
  readonly topIndustries: readonly string[];
  readonly growthRate?: number;
}

export interface MapMarker {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly label: string;
  readonly value: number;
  readonly type: "city" | "country";
  readonly metadata: Record<string, unknown>;
}
