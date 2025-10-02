import UsersSearchPageClient from "./search-client";
import { getSampleUserAPI } from "@/api-client/generated";
import { startMockServer } from "@/mocks/msw/node";
import type { DepartmentOption, SkillOption } from "@/services/user-filter-options";

export const dynamic = "force-dynamic";

const sampleUserApi = getSampleUserAPI();

export default async function UsersSearchPage() {
  startMockServer();

  const [skillOptions, departmentOptions] = await Promise.all([
    fetchSkillOptions(),
    fetchDepartmentOptions(),
  ]);

  return (
    <UsersSearchPageClient
      skillOptions={skillOptions}
      departmentOptions={departmentOptions}
    />
  );
}

async function fetchSkillOptions(): Promise<SkillOption[]> {
  try {
    const response = await sampleUserApi.filtersListSkillOptions();
    return response.data.items ?? [];
  } catch (error) {
    console.error("[users/search] Failed to fetch skill filter options", error);
    return [];
  }
}

async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  try {
    const response = await sampleUserApi.filtersListDepartmentOptions();
    return response.data.items ?? [];
  } catch (error) {
    console.error("[users/search] Failed to fetch department filter options", error);
    return [];
  }
}
