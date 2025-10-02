import React from "react";
import { memo } from "react";
import { FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";

import { CheckboxInput } from "@/components/atoms";

export type FeatureOption = {
  value: string;
  label: string;
};

export type FeatureCheckboxGroupProps = {
  options: FeatureOption[];
  value: string[];
  onToggle: (value: string) => void;
};

function FeatureCheckboxGroupComponent({ options, value, onToggle }: FeatureCheckboxGroupProps) {
  return (
    <FormControl component="fieldset" margin="none" sx={{ mt: 0 }}>
      <FormLabel component="legend">特性</FormLabel>
      <FormGroup row>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={<CheckboxInput checked={value.includes(option.value)} onChange={() => onToggle(option.value)} />}
            label={option.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

export const FeatureCheckboxGroup = memo(FeatureCheckboxGroupComponent);
