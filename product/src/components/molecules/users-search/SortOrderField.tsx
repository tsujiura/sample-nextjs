import React from "react";
import { memo } from "react";
import { FormControl, FormControlLabel, FormLabel } from "@mui/material";

import { RadioGroupInput, RadioInput } from "@/components/atoms";

export type SortOption = {
  value: string;
  label: string;
};

export type SortOrderFieldProps = {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
};

function SortOrderFieldComponent({ options, value, onChange }: SortOrderFieldProps) {
  return (
    <FormControl component="fieldset">
      <FormLabel id="sort-order-label">並び順</FormLabel>
      <RadioGroupInput
        aria-labelledby="sort-order-label"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<RadioInput />}
            label={option.label}
          />
        ))}
      </RadioGroupInput>
    </FormControl>
  );
}

export const SortOrderField = memo(SortOrderFieldComponent);