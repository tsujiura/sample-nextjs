import React from "react";
import { Typography, type TypographyProps } from "@mui/material";

export type HeadingProps = TypographyProps;

export default function Heading({ variant = "h4", component = "h1", ...props }: HeadingProps) {
  return <Typography variant={variant} component={component} {...props} />;
}