import React from "react";
import { RadioGroup, type RadioGroupProps } from "@mui/material";

export type RadioGroupInputProps = RadioGroupProps;

export default function RadioGroupInput({ row = true, ...props }: RadioGroupInputProps) {
  return <RadioGroup row={row} {...props} />;
}