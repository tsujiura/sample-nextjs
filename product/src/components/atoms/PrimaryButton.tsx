import React from "react";
import { Button, type ButtonProps } from "@mui/material";

export type PrimaryButtonProps = ButtonProps;

export default function PrimaryButton({ variant = "contained", color = "primary", ...props }: PrimaryButtonProps) {
  return <Button variant={variant} color={color} {...props} />;
}