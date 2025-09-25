import { config as loadEnv } from "dotenv";

const resolvedAppEnv = process.env.APP_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "local");

loadEnv({ path: `.env.${resolvedAppEnv}` });
loadEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_ENV: resolvedAppEnv,
  },
};

export default nextConfig;
