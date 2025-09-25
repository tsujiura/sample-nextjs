"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import axiosInstance from "@/api-client/axios-instance";

type User = {
  id: string;
  name: string;
  email: string;
};

type UsersResponse = {
  users: User[];
};

async function fetchUsers(keyword: string): Promise<User[]> {
  const response = await axiosInstance.get<UsersResponse>("/api/users", {
    params: { q: keyword },
  });

  return response.data.users;
}

export default function UsersSearchPage() {
  return (
    <Suspense fallback={<UsersSearchPageFallback />}>
      <UsersSearchPageContent />
    </Suspense>
  );
}

function UsersSearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsString = searchParams?.toString() ?? "";

  const currentQuery = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    return params.get("q")?.trim() ?? "";
  }, [searchParamsString]);

  const [keyword, setKeyword] = useState(currentQuery);

  useEffect(() => {
    setKeyword(currentQuery);
  }, [currentQuery]);

  const { data: users = [], isFetching, isSuccess } = useQuery({
    queryKey: ["users", currentQuery],
    queryFn: () => fetchUsers(currentQuery),
    enabled: currentQuery.length > 0,
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = keyword.trim();
      const params = new URLSearchParams(searchParamsString);

      if (trimmed.length > 0) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const nextSearch = params.toString();
      const nextUrl = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [keyword, pathname, router, searchParamsString],
  );

  const handleKeywordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  return (
    <Stack spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Users 検索
        </Typography>
        <Typography color="text.secondary">
          キーワードでユーザーを検索し、結果を一覧表示します。
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, maxWidth: 480 }}>
        <TextField
          fullWidth
          label="検索キーワード"
          name="q"
          value={keyword}
          onChange={handleKeywordChange}
        />
        <Button type="submit" variant="contained" sx={{ flexShrink: 0 }}>
          検索
        </Button>
      </Box>

      <Paper variant="outlined">
        <Table aria-label="検索結果">
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>メールアドレス</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Stack alignItems="center" direction="row" justifyContent="center" spacing={2}>
                    <CircularProgress size={24} />
                    <span>検索中...</span>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && isSuccess && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  条件に一致するユーザーが見つかりませんでした。
                </TableCell>
              </TableRow>
            )}

            {!isFetching && users.length > 0 &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}

function UsersSearchPageFallback() {
  return (
    <Stack spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Users 検索
        </Typography>
        <Typography color="text.secondary">
          画面を読み込み中です…
        </Typography>
      </Stack>
      <Paper variant="outlined">
        <Table aria-label="検索結果">
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} align="center">
                <Stack alignItems="center" direction="row" justifyContent="center" spacing={2}>
                  <CircularProgress size={24} />
                  <span>読み込み中...</span>
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
