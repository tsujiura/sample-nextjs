import React from "react";
import { Typography, type TypographyProps } from "@mui/material";

export type BodyTextProps = TypographyProps;

export default function BodyText({ variant = "body1", component = "p", color = "text.secondary", ...props }: BodyTextProps) {
  return <Typography variant={variant} component={component} color={color} {...props} />;
}