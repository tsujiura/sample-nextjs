export type QueryConfig = {
  staleTime: number;
  retry: number;
};

export type EnvConfig = {
  appEnv: EnvName;
  apiBaseUrl: string;
  mswEnabled: boolean;
  serverCacheTtlMs: number;
  serverCacheMaxEntries: number;
  query: QueryConfig;
};

export type EnvName = "local" | "development" | "staging" | "production";
