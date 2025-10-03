import SamplePageClient from "./search-client";
import { getSampleItemAPI } from "@/api-client/generated";
import { startMockServer } from "@/mocks/msw/node";
import type { SectionOption, TokenOption } from "@/services/sample-filter-options";

export const dynamic = "force-dynamic";

const sampleApi = getSampleItemAPI();

export default async function SampleSearchPage() {
  startMockServer();

  const [tokenOptions, sectionOptions] = await Promise.all([
    fetchTokenChoices(),
    fetchSectionChoices(),
  ]);

  return (
    <SamplePageClient
      tokenOptions={tokenOptions}
      sectionOptions={sectionOptions}
    />
  );
}

async function fetchTokenChoices(): Promise<TokenOption[]> {
  try {
    const response = await sampleApi.filtersListTokenOptions();
    return response.data.items ?? [];
  } catch (error) {
    console.error("[sample/search] Failed to fetch token filter options", error);
    return [];
  }
}

async function fetchSectionChoices(): Promise<SectionOption[]> {
  try {
    const response = await sampleApi.filtersListSectionOptions();
    return response.data.items ?? [];
  } catch (error) {
    console.error("[sample/search] Failed to fetch section filter options", error);
    return [];
  }
}
