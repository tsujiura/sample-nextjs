import { EnvConfig } from "./types";

const development: EnvConfig = {
  appEnv: "development",
  apiBaseUrl: "https://dev.example.com",
  mswEnabled: false,
  serverCacheTtlMs: 60_000,
  serverCacheMaxEntries: 256,
  query: {
    staleTime: 45_000,
    retry: 1,
  },
};

export default development;
