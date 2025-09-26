import React from "react";
import { memo } from "react";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { LoadingIndicator } from "@/components/atoms";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  employment: string;
  joinedAt: string;
};

export type UsersSearchResultsTableProps = {
  users: UserRow[];
  departmentLabelLookup: (value: string) => string;
  employmentLabelLookup: (value: string) => string;
  isLoading: boolean;
  showPrompt: boolean;
  emptyMessage?: string;
  promptMessage?: string;
};

function UsersSearchResultsTableComponent({
  users,
  departmentLabelLookup,
  employmentLabelLookup,
  isLoading,
  showPrompt,
  emptyMessage = "条件に一致するユーザーが見つかりませんでした。",
  promptMessage = "条件を入力して検索してください。",
}: UsersSearchResultsTableProps) {
  const hasUsers = users.length > 0;

  return (
    <Paper variant="outlined">
      <Table aria-label="検索結果">
        <TableHead>
          <TableRow>
            <TableCell>名前</TableCell>
            <TableCell>メールアドレス</TableCell>
            <TableCell>部署</TableCell>
            <TableCell>雇用形態</TableCell>
            <TableCell>入社日</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <LoadingIndicator label="検索中..." />
              </TableCell>
            </TableRow>
          )}

          {!isLoading && showPrompt && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography component="span">{promptMessage}</Typography>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !showPrompt && !hasUsers && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography component="span">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && hasUsers &&
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{departmentLabelLookup(user.department)}</TableCell>
                <TableCell>{employmentLabelLookup(user.employment)}</TableCell>
                <TableCell>{user.joinedAt}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export const UsersSearchResultsTable = memo(UsersSearchResultsTableComponent);