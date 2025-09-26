import React from "react";
import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";

export type TextInputProps = TextFieldProps;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { fullWidth = true, margin = "normal", ...props },
  ref,
) {
  return <TextField fullWidth={fullWidth} margin={margin} inputRef={ref} {...props} />;
});

export default TextInput;