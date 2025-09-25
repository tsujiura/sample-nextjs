import { EnvConfig } from "./types";

const local: EnvConfig = {
  appEnv: "local",
  apiBaseUrl: "https://example.com",
  mswEnabled: true,
  serverCacheTtlMs: 60_000,
  serverCacheMaxEntries: 128,
  query: {
    staleTime: 30_000,
    retry: 0,
  },
};

export default local;
