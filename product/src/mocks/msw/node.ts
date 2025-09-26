import { ENV } from "@/config/env";

import { server } from "./server";

let serverStarted = false;

export function startMockServer(): void {
  if (!shouldUseMockServer()) {
    return;
  }

  if (serverStarted) {
    return;
  }

  server.listen({ onUnhandledRequest: "bypass" });
  serverStarted = true;
}

export function stopMockServer(): void {
  if (!serverStarted) {
    return;
  }

  server.close();
  serverStarted = false;
}

function shouldUseMockServer(): boolean {
  if (!ENV.mswEnabled) {
    return false;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (ENV.appEnv !== "local") {
    return false;
  }

  return true;
}
