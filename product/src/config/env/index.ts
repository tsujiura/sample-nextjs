import development from "./development";
import local from "./local";
import production from "./production";
import staging from "./staging";
import type { EnvConfig, EnvName } from "./types";

const CONFIG_BY_ENV: Record<EnvName, EnvConfig> = {
  local,
  development,
  staging,
  production,
};

function coerceEnvName(value: string | undefined): EnvName {
  if (value === "development" || value === "staging" || value === "production") {
    return value;
  }

  return "local";
}

function pickBaseConfig(explicitEnvName?: EnvName): EnvConfig {
  if (explicitEnvName) {
    return CONFIG_BY_ENV[explicitEnvName];
  }

  const envNameFromProcess = coerceEnvName(process.env.APP_ENV);

  if (envNameFromProcess !== "local") {
    return CONFIG_BY_ENV[envNameFromProcess];
  }

  if (process.env.NODE_ENV === "production") {
    return CONFIG_BY_ENV.production;
  }

  return CONFIG_BY_ENV.local;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function toNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
}

function resolveConfig(explicitEnvName?: EnvName): EnvConfig {
  const base = pickBaseConfig(explicitEnvName);

  return {
    ...base,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? base.apiBaseUrl,
    mswEnabled: toBoolean(process.env.NEXT_PUBLIC_API_MOCK, base.mswEnabled),
    serverCacheTtlMs: toNumber(process.env.SERVER_CACHE_TTL_MS, base.serverCacheTtlMs),
    serverCacheMaxEntries: base.serverCacheMaxEntries,
    query: base.query,
  };
}

let cachedEnv = resolveConfig();

export let ENV = cachedEnv;

export function reloadEnv(explicitEnvName?: EnvName): EnvConfig {
  cachedEnv = resolveConfig(explicitEnvName);
  ENV = cachedEnv;
  return cachedEnv;
}

export function getEnv(): EnvConfig {
  return cachedEnv;
}

export type { EnvConfig, EnvName };
