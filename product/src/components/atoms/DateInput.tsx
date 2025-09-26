import React from "react";
import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";

export type DateInputProps = TextFieldProps;

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  { fullWidth = true, InputLabelProps = { shrink: true }, type = "date", margin = "normal", ...props },
  ref,
) {
  return (
    <TextField
      fullWidth={fullWidth}
      type={type}
      margin={margin}
      inputRef={ref}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...props}
    />
  );
});

export default DateInput;