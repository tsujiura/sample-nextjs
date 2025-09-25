import UsersSearchPageClient from "./search-client";

import {
  getDepartmentOptions,
  getSkillOptions,
} from "@/services/user-filter-options";

export const dynamic = "force-dynamic";

export default async function UsersSearchPage() {
  const [skillOptions, departmentOptions] = await Promise.all([
    getSkillOptions(),
    getDepartmentOptions(),
  ]);

  return (
    <UsersSearchPageClient
      skillOptions={skillOptions}
      departmentOptions={departmentOptions}
    />
  );
}
