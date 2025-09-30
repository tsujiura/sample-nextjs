import { headers } from "next/headers";

import UsersSearchPageClient from "./search-client";


export const dynamic = "force-dynamic";

export default async function UsersSearchPage() {
  const origin = await resolveApiOrigin();
  const [skillOptions, departmentOptions] = await Promise.all([
    fetchFilterOptions(origin, "/api/filters/skills"),
    fetchFilterOptions(origin, "/api/filters/departments"),
  ]);

  return (
    <UsersSearchPageClient
      skillOptions={skillOptions}
      departmentOptions={departmentOptions}
    />
  );
}

type FilterOptionsResponse = {
  items: FilterOption[];
};

type FilterOption = {
  value: string;
  label: string;
};

async function resolveApiOrigin(): Promise<string> {
  const headerList = await headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const forwardedProto = headerList.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = headerList.get("host");
  if (host) {
    return `http://${host}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl;
  }

  return "http://localhost:3000";
}

async function fetchFilterOptions(
  origin: string,
  path: `/api/${string}`,
): Promise<FilterOption[]> {
  try {
    const response = await fetch(`${origin}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} response from ${path}`);
    }

    const payload = (await response.json()) as FilterOptionsResponse;

    return payload.items ?? [];
  } catch (error) {
    console.error(`[users/search] Failed to fetch filter options from ${path}`, error);
    return [];
  }
}
