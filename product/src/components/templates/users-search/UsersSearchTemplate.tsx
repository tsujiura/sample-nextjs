import React from "react";
import { Stack, type StackProps } from "@mui/material";
import { memo, type ReactNode } from "react";

import { BodyText, Heading } from "@/components/atoms";

export type UsersSearchTemplateProps = {
  title?: string;
  description?: string;
  filters: ReactNode;
  results: ReactNode;
  stackProps?: StackProps;
  spacing?: number;
};

function UsersSearchTemplateComponent({
  title = "Users 検索",
  description = "複数の条件を組み合わせてユーザーを検索できます。",
  filters,
  results,
  spacing = 4,
  stackProps = {},
}: UsersSearchTemplateProps) {
  return (
    <Stack spacing={spacing} sx={{ p: { xs: 3, md: 6 } }} {...stackProps}>
      <Stack spacing={1}>
        <Heading>{title}</Heading>
        <BodyText>{description}</BodyText>
      </Stack>

      {filters}

      {results}
    </Stack>
  );
}

export const UsersSearchTemplate = memo(UsersSearchTemplateComponent);
