import React from "react";
import { memo } from "react";
import { Chip, TextField } from "@mui/material";

import { AutocompleteInput } from "@/components/atoms";

export type SkillOption = {
  value: string;
  label: string;
};

export type SkillAutocompleteFieldProps = {
  options: SkillOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

function SkillAutocompleteFieldComponent({ options, value, onChange }: SkillAutocompleteFieldProps) {
  return (
    <AutocompleteInput<SkillOption, true, false, false>
      multiple
      disableCloseOnSelect
      value={options.filter((option) => value.includes(option.value))}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip label={option.label} {...getTagProps({ index })} key={option.value} />
        ))
      }
      renderInput={(params) => <TextField {...params} label="スキル" placeholder="スキルを選択" />}
      onChange={(_, selected) => {
        onChange(selected.map((option) => option.value));
      }}
    />
  );
}

export const SkillAutocompleteField = memo(SkillAutocompleteFieldComponent);