import type { NextRequest } from "next/server";

import { fetchFromUsersApi, toNextResponse } from "../../_utils/upstream";

export async function GET(request: NextRequest) {
  const upstreamResponse = await fetchFromUsersApi("/api/users/filters/departments", request);
  return await toNextResponse(upstreamResponse);
}
