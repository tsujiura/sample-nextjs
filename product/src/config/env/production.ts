import { EnvConfig } from "./types";

const production: EnvConfig = {
  appEnv: "production",
  apiBaseUrl: "https://api.example.com",
  mswEnabled: false,
  serverCacheTtlMs: 300_000,
  serverCacheMaxEntries: 512,
  query: {
    staleTime: 15_000,
    retry: 1,
  },
};

export default production;
