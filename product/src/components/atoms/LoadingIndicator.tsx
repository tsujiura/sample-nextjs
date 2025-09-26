import React from "react";
import { CircularProgress, Stack, type StackProps, Typography } from "@mui/material";

export type LoadingIndicatorProps = StackProps & {
  label?: string;
};

export default function LoadingIndicator({ label = "読み込み中...", spacing = 2, ...props }: LoadingIndicatorProps) {
  return (
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={spacing} {...props}>
      <CircularProgress size={24} />
      <Typography component="span">{label}</Typography>
    </Stack>
  );
}