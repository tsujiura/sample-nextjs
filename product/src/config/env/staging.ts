import { EnvConfig } from "./types";

const staging: EnvConfig = {
  appEnv: "staging",
  apiBaseUrl: "https://staging.example.com",
  mswEnabled: false,
  serverCacheTtlMs: 120_000,
  serverCacheMaxEntries: 256,
  query: {
    staleTime: 30_000,
    retry: 1,
  },
};

export default staging;
