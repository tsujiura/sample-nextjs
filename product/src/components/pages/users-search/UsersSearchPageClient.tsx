"use client";

import React from "react";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { axiosInstance } from "@/api-client/axios-instance";
import type {
  DepartmentOption,
  FeatureOption,
  SkillOption,
  SortOption,
} from "@/components/molecules/users-search";
import { UsersSearchFiltersForm, UsersSearchResultsTable, type UserRow } from "@/components/organisms/users-search";
import { UsersSearchTemplate } from "@/components/templates/users-search";
import { LoadingIndicator } from "@/components/atoms";
import {
  hasMeaningfulFilters,
  parseFilters,
  type SearchFilters,
} from "@/app/users/search/filter-utils";

type UsersResponse = {
  users: UserRow[];
};

type UsersSearchPageClientProps = {
  skillOptions: SkillOption[];
  departmentOptions: DepartmentOption[];
};

const sortOptions: SortOption[] = [
  { value: "joined-desc", label: "参加日が新しい順" },
  { value: "joined-asc", label: "参加日が古い順" },
];

const featureOptions: FeatureOption[] = [
  { value: "remote", label: "リモート勤務" },
  { value: "mentor", label: "メンター経験" },
  { value: "leader", label: "リーダー経験" },
  { value: "newgrad", label: "新卒採用枠" },
];

const employmentLabels: Record<string, string> = {
  "full-time": "正社員",
  contract: "契約",
  intern: "インターン",
};

async function fetchUsers(filters: SearchFilters): Promise<UserRow[]> {
  const response = await axiosInstance<UsersResponse>({
    url: "/api/users",
    method: "GET",
    params: {
      q: filters.keyword,
      skills: filters.skills,
      departments: filters.departments,
      joinedAfter: filters.joinedAfter ?? undefined,
      sort: filters.sortOrder ?? undefined,
      features: filters.features,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data.users;
}

function UsersSearchPageContent({ skillOptions, departmentOptions }: UsersSearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";

  const filterState = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    return parseFilters(params);
  }, [searchParamsString]);

  const [keyword, setKeyword] = useState(filterState.keyword);
  const [skills, setSkills] = useState<string[]>(filterState.skills);
  const [departments, setDepartments] = useState<string[]>(filterState.departments);
  const [joinedAfter, setJoinedAfter] = useState<string | null>(filterState.joinedAfter);
  const [sortOrder, setSortOrder] = useState<string>(filterState.sortOrder ?? sortOptions[0]?.value ?? "joined-desc");
  const [features, setFeatures] = useState<string[]>(filterState.features);

  useEffect(() => {
    setKeyword(filterState.keyword);
    setSkills(filterState.skills);
    setDepartments(filterState.departments);
    setJoinedAfter(filterState.joinedAfter);
    setSortOrder(filterState.sortOrder ?? sortOptions[0]?.value ?? "joined-desc");
    setFeatures(filterState.features);
  }, [filterState]);

  const filtersAreMeaningful = useMemo(
    () => hasMeaningfulFilters(filterState),
    [filterState],
  );

  const departmentLabelMap = useMemo(() => new Map(departmentOptions.map((option) => [option.value, option.label])), [departmentOptions]);

  const queryKey = useMemo(
    () => [
      "users",
      filterState.keyword,
      [...filterState.skills].sort().join(","),
      [...filterState.departments].sort().join(","),
      filterState.joinedAfter ?? "",
      filterState.sortOrder ?? "",
      [...filterState.features].sort().join(","),
    ],
    [filterState],
  );

  const { data: users = [], isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchUsers(filterState),
    enabled: filtersAreMeaningful,
    staleTime: 0,
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const params = new URLSearchParams();
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword.length > 0) {
        params.set("q", trimmedKeyword);
      }

      if (skills.length > 0) {
        skills.forEach((value) => params.append("skills", value));
      }

      if (departments.length > 0) {
        departments.forEach((value) => params.append("departments", value));
      }

      if (joinedAfter) {
        params.set("joinedAfter", joinedAfter);
      }

      if (sortOrder) {
        params.set("sort", sortOrder);
      }

      if (features.length > 0) {
        features.forEach((value) => params.append("features", value));
      }

      const nextSearch = params.toString();
      const nextUrl = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [keyword, skills, departments, joinedAfter, sortOrder, features, pathname, router],
  );

  const handleFeatureToggle = useCallback((value: string) => {
    setFeatures((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }, []);

  const departmentLabelLookup = useCallback((value: string) => departmentLabelMap.get(value) ?? value, [departmentLabelMap]);
  const employmentLabelLookup = useCallback((value: string) => employmentLabels[value] ?? value, []);

  return (
    <UsersSearchTemplate
      filters={
        <UsersSearchFiltersForm
          keyword={keyword}
          skillOptions={skillOptions}
          selectedSkills={skills}
          departmentOptions={departmentOptions}
          selectedDepartments={departments}
          joinedAfter={joinedAfter}
          sortOptions={sortOptions}
          sortOrder={sortOrder}
          featureOptions={featureOptions}
          selectedFeatures={features}
          onKeywordChange={setKeyword}
          onSkillsChange={setSkills}
          onDepartmentsChange={setDepartments}
          onJoinedAfterChange={setJoinedAfter}
          onSortOrderChange={setSortOrder}
          onFeatureToggle={handleFeatureToggle}
          onSubmit={handleSubmit}
          isSubmitting={isFetching}
        />
      }
      results={
        <UsersSearchResultsTable
          users={users}
          departmentLabelLookup={departmentLabelLookup}
          employmentLabelLookup={employmentLabelLookup}
          isLoading={isFetching}
          showPrompt={!filtersAreMeaningful}
        />
      }
    />
  );
}

function UsersSearchPageFallback() {
  return (
    <UsersSearchTemplate
      filters={<LoadingIndicator label="条件を読み込み中..." />}
      results={<LoadingIndicator label="読み込み中..." />}
    />
  );
}

export default function UsersSearchPageClient(props: UsersSearchPageClientProps) {
  return (
    <Suspense fallback={<UsersSearchPageFallback />}>
      <UsersSearchPageContent {...props} />
    </Suspense>
  );
}
