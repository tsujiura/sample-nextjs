import { NextResponse } from "next/server";

import { getDepartmentOptions } from "@/services/user-filter-options";

export async function GET() {
  const items = await getDepartmentOptions();
  return NextResponse.json({ items });
}
