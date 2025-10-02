import React from "react";
import { memo } from "react";
import type { TextFieldProps } from "@mui/material";

import { TextInput } from "@/components/atoms";

export type KeywordFieldProps = {
  value: string;
  onChange: (value: string) => void;
} & Pick<TextFieldProps, "placeholder">;

function KeywordFieldComponent({ value, onChange, placeholder }: KeywordFieldProps) {
  return (
    <TextInput
      label="検索キーワード"
      value={value}
      placeholder={placeholder}
      margin="none"
      InputLabelProps={{ shrink: true }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export const KeywordField = memo(KeywordFieldComponent);
