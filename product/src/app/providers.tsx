"use client";

import React, { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ENV } from "@/config/env";

type ProvidersProps = {
  children: ReactNode;
  queryClient?: QueryClient;
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: ENV.query.retry,
        staleTime: ENV.query.staleTime,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function createTestQueryClient(): QueryClient {
  return createQueryClient();
}

export default function Providers({ children, queryClient }: ProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
