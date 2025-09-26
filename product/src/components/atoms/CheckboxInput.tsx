import React from "react";
import { forwardRef } from "react";
import { Checkbox, type CheckboxProps } from "@mui/material";

export type CheckboxInputProps = CheckboxProps;

const CheckboxInput = forwardRef<HTMLButtonElement, CheckboxInputProps>(function CheckboxInput(props, ref) {
  return <Checkbox inputRef={ref} {...props} />;
});

export default CheckboxInput;