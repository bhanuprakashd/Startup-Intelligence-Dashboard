export interface NewsArticle {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly content?: string;
  readonly url: string;
  readonly imageUrl?: string;
  readonly source: string;
  readonly author?: string;
  readonly publishedAt: string;
  readonly category: string;
  readonly industry?: string;
  readonly country?: string;
  readonly sentiment?: "positive" | "neutral" | "negative";
  readonly tags: readonly string[];
}
