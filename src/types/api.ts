export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly meta: {
    readonly source: string;
    readonly cachedAt: string;
    readonly refreshedAt: string;
    readonly total?: number;
    readonly page?: number;
    readonly limit?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly meta: ApiResponse<T[]>["meta"] & {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly hasMore: boolean;
  };
}
