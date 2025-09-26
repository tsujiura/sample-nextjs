"use client";

import { ReactNode, useEffect } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import Providers from "./providers";
import { ENV } from "@/config/env";
import theme from "@/theme/theme";

const MSW_START_FLAG = "__app_msw_worker_started";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    if (!ENV.mswEnabled) {
      return;
    }

    if (ENV.appEnv !== "local") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (process.env.NODE_ENV === "production") {
      return;
    }

    const globalScope = window as typeof window & {
      [MSW_START_FLAG]?: boolean;
    };

    if (globalScope[MSW_START_FLAG]) {
      return;
    }

    void import("@/mocks/msw/browser")
      .then(({ worker }) => {
        return worker.start({ onUnhandledRequest: "bypass" });
      })
      .then(() => {
        globalScope[MSW_START_FLAG] = true;
      })
      .catch(() => {
        // Swallow MSW boot errors in test or build environments where Service Workers are unavailable.
      });
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Providers>{children}</Providers>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

// NOTE: The project defaults to the v15 App Router integration entry point above.
// If you encounter build issues with older Next.js versions, change the import to
// `import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";` as a fallback.
