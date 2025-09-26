import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { UsersSearchFiltersForm } from "@/components/organisms/users-search";
import type {
  DepartmentOption,
  FeatureOption,
  SkillOption,
  SortOption,
} from "@/components/molecules/users-search";

const skillOptions: SkillOption[] = [
  { value: "frontend", label: "フロントエンド" },
  { value: "backend", label: "バックエンド" },
];

const departmentOptions: DepartmentOption[] = [
  { value: "development", label: "開発" },
  { value: "design", label: "デザイン" },
];

const sortOptions: SortOption[] = [
  { value: "joined-desc", label: "新しい順" },
  { value: "joined-asc", label: "古い順" },
];

const featureOptions: FeatureOption[] = [
  { value: "remote", label: "リモート勤務" },
  { value: "mentor", label: "メンター経験" },
];

describe("UsersSearchFiltersForm", () => {
  it("submits user selections", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const handleKeyword = vi.fn();

    render(
      <UsersSearchFiltersForm
        keyword=""
        skillOptions={skillOptions}
        selectedSkills={[]}
        departmentOptions={departmentOptions}
        selectedDepartments={[]}
        joinedAfter={null}
        sortOptions={sortOptions}
        sortOrder={sortOptions[0].value}
        featureOptions={featureOptions}
        selectedFeatures={[]}
        onKeywordChange={handleKeyword}
        onSkillsChange={vi.fn()}
        onDepartmentsChange={vi.fn()}
        onJoinedAfterChange={vi.fn()}
        onSortOrderChange={vi.fn()}
        onFeatureToggle={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("検索キーワード"), { target: { value: "山田" } });
    fireEvent.submit(screen.getByRole("button", { name: "検索" }));

    expect(handleKeyword).toHaveBeenCalledWith("山田");
    expect(onSubmit).toHaveBeenCalled();
  });
});