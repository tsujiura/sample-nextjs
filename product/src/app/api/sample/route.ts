import type { NextRequest } from "next/server";

import { fetchFromApi, toNextResponse } from "../_utils/upstream";

export async function GET(request: NextRequest) {
  const upstreamResponse = await fetchFromApi("/api/fizz", request);
  return await toNextResponse(upstreamResponse);
}
