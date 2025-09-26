import React from "react";
import { forwardRef } from "react";
import { Radio, type RadioProps } from "@mui/material";

export type RadioInputProps = RadioProps;

const RadioInput = forwardRef<HTMLButtonElement, RadioInputProps>(function RadioInput(props, ref) {
  return <Radio inputRef={ref} {...props} />;
});

export default RadioInput;