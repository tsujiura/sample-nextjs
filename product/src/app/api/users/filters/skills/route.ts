import { NextResponse } from "next/server";

import { getSkillOptions } from "@/services/user-filter-options";

export async function GET() {
  const items = await getSkillOptions();
  return NextResponse.json({ items });
}
