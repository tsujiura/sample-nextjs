import React from "react";
import { memo } from "react";

import { DateInput } from "@/components/atoms";

export type JoinedAfterFieldProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

function JoinedAfterFieldComponent({ value, onChange }: JoinedAfterFieldProps) {
  return (
    <DateInput
      label="入社日 (以降)"
      value={value ?? ""}
      margin="none"
      InputLabelProps={{ shrink: true }}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(nextValue.length > 0 ? nextValue : null);
      }}
    />
  );
}

export const JoinedAfterField = memo(JoinedAfterFieldComponent);
