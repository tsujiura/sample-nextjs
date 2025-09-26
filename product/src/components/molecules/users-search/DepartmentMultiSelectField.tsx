import React from "react";
import { memo } from "react";
import { FormControl, InputLabel, MenuItem, ListItemText } from "@mui/material";

import { CheckboxInput, MultiSelectInput } from "@/components/atoms";

export type DepartmentOption = {
  value: string;
  label: string;
};

export type DepartmentMultiSelectFieldProps = {
  options: DepartmentOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

function DepartmentMultiSelectFieldComponent({ options, value, onChange }: DepartmentMultiSelectFieldProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="department-select-label">部署</InputLabel>
      <MultiSelectInput
        labelId="department-select-label"
        value={value}
        label="部署"
        renderValue={(selected) =>
          (selected as string[])
            .map((selectedValue) => options.find((option) => option.value === selectedValue)?.label ?? selectedValue)
            .join(", ")
        }
        onChange={(event) => {
          const nextValue = event.target.value;
          if (Array.isArray(nextValue)) {
            onChange(nextValue);
            return;
          }

          if (typeof nextValue === "string") {
            onChange(nextValue.split(",").filter(Boolean));
            return;
          }

          onChange([]);
        }}
      >
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <MenuItem key={option.value} value={option.value}>
              <CheckboxInput checked={selected} />
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </MultiSelectInput>
    </FormControl>
  );
}

export const DepartmentMultiSelectField = memo(DepartmentMultiSelectFieldComponent);