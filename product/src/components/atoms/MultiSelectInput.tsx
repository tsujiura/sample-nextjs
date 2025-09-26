import React from "react";
import { forwardRef } from "react";
import { Select, type SelectProps } from "@mui/material";

export type MultiSelectInputProps<T = unknown> = SelectProps<T>;

const MultiSelectInput = forwardRef<HTMLElement, MultiSelectInputProps>(function MultiSelectInput(
  props,
  ref,
) {
  return <Select multiple displayEmpty inputRef={ref} {...props} />;
});

export default MultiSelectInput;