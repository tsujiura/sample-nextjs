import React from "react";
import { Box, type BoxProps, Stack } from "@mui/material";
import { memo, type FormEventHandler } from "react";

import {
  DepartmentMultiSelectField,
  FeatureCheckboxGroup,
  JoinedAfterField,
  KeywordField,
  SearchActionRow,
  SkillAutocompleteField,
  SortOrderField,
  type DepartmentOption,
  type FeatureOption,
  type SkillOption,
  type SortOption,
} from "@/components/molecules/users-search";

export type UsersSearchFiltersFormProps = {
  keyword: string;
  skillOptions: SkillOption[];
  selectedSkills: string[];
  departmentOptions: DepartmentOption[];
  selectedDepartments: string[];
  joinedAfter: string | null;
  sortOptions: SortOption[];
  sortOrder: string;
  featureOptions: FeatureOption[];
  selectedFeatures: string[];
  isSubmitting?: boolean;
  onKeywordChange: (value: string) => void;
  onSkillsChange: (value: string[]) => void;
  onDepartmentsChange: (value: string[]) => void;
  onJoinedAfterChange: (value: string | null) => void;
  onSortOrderChange: (value: string) => void;
  onFeatureToggle: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
} & Omit<BoxProps, "onSubmit">;

function UsersSearchFiltersFormComponent({
  keyword,
  skillOptions,
  selectedSkills,
  departmentOptions,
  selectedDepartments,
  joinedAfter,
  sortOptions,
  sortOrder,
  featureOptions,
  selectedFeatures,
  isSubmitting = false,
  onKeywordChange,
  onSkillsChange,
  onDepartmentsChange,
  onJoinedAfterChange,
  onSortOrderChange,
  onFeatureToggle,
  onSubmit,
  ...boxProps
}: UsersSearchFiltersFormProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      display="grid"
      gap={3}
      gridTemplateColumns={{ xs: "repeat(1, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }}
      {...boxProps}
    >
      <Box gridColumn={{ xs: "span 1", md: "span 2", xl: "span 1" }}>
        <KeywordField value={keyword} onChange={onKeywordChange} />
      </Box>

      <Box gridColumn={{ xs: "span 1", md: "span 2", xl: "span 1" }}>
        <SkillAutocompleteField options={skillOptions} value={selectedSkills} onChange={onSkillsChange} />
      </Box>

      <Box gridColumn={{ xs: "span 1", md: "span 1" }}>
        <DepartmentMultiSelectField options={departmentOptions} value={selectedDepartments} onChange={onDepartmentsChange} />
      </Box>

      <Box gridColumn={{ xs: "span 1", md: "span 1" }}>
        <JoinedAfterField value={joinedAfter} onChange={onJoinedAfterChange} />
      </Box>

      <Box gridColumn={{ xs: "span 1", md: "span 1" }}>
        <SortOrderField options={sortOptions} value={sortOrder} onChange={onSortOrderChange} />
      </Box>

      <Box gridColumn={{ xs: "span 1", md: "span 2", xl: "span 3" }}>
        <FeatureCheckboxGroup options={featureOptions} value={selectedFeatures} onToggle={onFeatureToggle} />
      </Box>

      <Stack gridColumn={{ xs: "span 1", md: "span 2", xl: "span 3" }}>
        <SearchActionRow isSubmitting={isSubmitting} />
      </Stack>
    </Box>
  );
}

export const UsersSearchFiltersForm = memo(UsersSearchFiltersFormComponent);
