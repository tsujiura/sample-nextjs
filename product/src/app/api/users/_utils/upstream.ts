import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ENV } from "@/config/env";
import { startMockServer } from "@/mocks/msw/node";

export async function fetchFromUsersApi(
  path: `/api/${string}`,
  request: NextRequest,
): Promise<Response> {
  startMockServer();

  const upstreamUrl = composeUpstreamUrl(path, request);

  return fetch(upstreamUrl, {
    method: request.method,
    headers: buildHeaders(request),
    cache: "no-store",
  });
}

export async function toNextResponse(upstream: Response): Promise<NextResponse> {
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const status = upstream.status;

  if (contentType.includes("application/json")) {
    const data = await upstream.json();
    return NextResponse.json(data, { status });
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status,
    headers: {
      "content-type": contentType,
    },
  });
}

function composeUpstreamUrl(path: string, request: NextRequest): string {
  const upstreamUrl = new URL(path, ENV.apiBaseUrl);
  const currentUrl = new URL(request.url);
  upstreamUrl.search = currentUrl.search;
  return upstreamUrl.toString();
}

function buildHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.authorization = authorization;
  }

  return headers;
}
