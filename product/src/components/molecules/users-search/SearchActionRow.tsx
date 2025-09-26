import React from "react";
import { memo } from "react";
import { Stack, type StackProps } from "@mui/material";

import { PrimaryButton } from "@/components/atoms";

export type SearchActionRowProps = {
  isSubmitting?: boolean;
} & StackProps;

function SearchActionRowComponent({ isSubmitting = false, justifyContent = { xs: "flex-start", md: "flex-end" }, ...props }: SearchActionRowProps) {
  return (
    <Stack direction="row" justifyContent={justifyContent} {...props}>
      <PrimaryButton type="submit" disabled={isSubmitting} sx={{ minWidth: 160 }}>
        検索
      </PrimaryButton>
    </Stack>
  );
}

export const SearchActionRow = memo(SearchActionRowComponent);