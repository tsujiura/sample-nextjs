"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  type SelectChangeEvent,
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

import { UsersListUsersSort, getSampleUserAPI } from "@/api-client/generated";
import {
  hasMeaningfulFilters,
  parseFilters,
  type SearchFilters,
} from "@/app/users/search/filter-utils";
import type { DepartmentOption, SkillOption } from "@/services/user-filter-options";

type FeatureOption = {
  value: string;
  label: string;
};

type SortOption = {
  value: string;
  label: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  employment: string;
  joinedAt: string;
};

type UsersSearchPageClientProps = {
  skillOptions: SkillOption[];
  departmentOptions: DepartmentOption[];
};

const sampleUserApi = getSampleUserAPI();

const sortOptions: SortOption[] = [
  { value: "joined-desc", label: "参加日が新しい順" },
  { value: "joined-asc", label: "参加日が古い順" },
];

const featureOptions: FeatureOption[] = [
  { value: "remote", label: "リモート勤務" },
  { value: "mentor", label: "メンター経験" },
  { value: "leader", label: "リーダー経験" },
  { value: "newgrad", label: "新卒採用枠" },
];

const employmentLabels: Record<string, string> = {
  "full-time": "正社員",
  contract: "契約",
  intern: "インターン",
};

async function fetchUsers(filters: SearchFilters): Promise<UserRow[]> {
  const sortParam = toUsersListUsersSort(filters.sortOrder);

  const response = await sampleUserApi.usersListUsers({
    q: filters.keyword,
    skills: filters.skills,
    departments: filters.departments,
    joinedAfter: filters.joinedAfter ?? undefined,
    sort: sortParam,
    features: filters.features,
  });

  return response.data.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    employment: user.employment,
    joinedAt: user.joinedAt,
  }));
}

function toUsersListUsersSort(value: string | null): UsersListUsersSort | undefined {
  if (value === UsersListUsersSort["joined-asc"] || value === UsersListUsersSort["joined-desc"]) {
    return value;
  }

  return undefined;
}

function PageLayout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1">
          Users 検索
        </Typography>
        <Typography variant="body1" color="text.secondary">
          複数の条件を組み合わせてユーザーを検索できます。
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

function LoadingSection({ label }: { label: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 3 }}
    >
      <CircularProgress size={20} aria-label={label} />
      <Typography component="span">{label}</Typography>
    </Stack>
  );
}

function UsersSearchPageContent({ skillOptions, departmentOptions }: UsersSearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";

  const filterState = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    return parseFilters(params);
  }, [searchParamsString]);

  const [keyword, setKeyword] = useState(filterState.keyword);
  const [skills, setSkills] = useState<string[]>(filterState.skills);
  const [departments, setDepartments] = useState<string[]>(filterState.departments);
  const [joinedAfter, setJoinedAfter] = useState<string | null>(filterState.joinedAfter);
  const [sortOrder, setSortOrder] = useState<string>(filterState.sortOrder ?? sortOptions[0]?.value ?? "joined-desc");
  const [features, setFeatures] = useState<string[]>(filterState.features);

  useEffect(() => {
    setKeyword(filterState.keyword);
    setSkills(filterState.skills);
    setDepartments(filterState.departments);
    setJoinedAfter(filterState.joinedAfter);
    setSortOrder(filterState.sortOrder ?? sortOptions[0]?.value ?? "joined-desc");
    setFeatures(filterState.features);
  }, [filterState]);

  const filtersAreMeaningful = useMemo(
    () => hasMeaningfulFilters(filterState),
    [filterState],
  );

  const departmentLabelMap = useMemo(
    () => new Map(departmentOptions.map((option) => [option.value, option.label])),
    [departmentOptions],
  );

  const selectedSkillOptions = useMemo(
    () => skillOptions.filter((option) => skills.includes(option.value)),
    [skillOptions, skills],
  );

  const queryKey = useMemo(
    () => [
      "users",
      filterState.keyword,
      [...filterState.skills].sort().join(","),
      [...filterState.departments].sort().join(","),
      filterState.joinedAfter ?? "",
      filterState.sortOrder ?? "",
      [...filterState.features].sort().join(","),
    ],
    [filterState],
  );

  const { data: users = [], isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchUsers(filterState),
    enabled: filtersAreMeaningful,
    staleTime: 0,
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const params = new URLSearchParams();
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword.length > 0) {
        params.set("q", trimmedKeyword);
      }

      if (skills.length > 0) {
        skills.forEach((value) => params.append("skills", value));
      }

      if (departments.length > 0) {
        departments.forEach((value) => params.append("departments", value));
      }

      if (joinedAfter) {
        params.set("joinedAfter", joinedAfter);
      }

      if (sortOrder) {
        params.set("sort", sortOrder);
      }

      if (features.length > 0) {
        features.forEach((value) => params.append("features", value));
      }

      const nextSearch = params.toString();
      const nextUrl = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [keyword, skills, departments, joinedAfter, sortOrder, features, pathname, router],
  );

  const handleFeatureToggle = useCallback((value: string) => {
    setFeatures((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }, []);

  const handleDepartmentChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      setDepartments(typeof value === "string" ? value.split(",") : value);
    },
    [setDepartments],
  );

  const departmentLabelLookup = useCallback((value: string) => departmentLabelMap.get(value) ?? value, [departmentLabelMap]);
  const employmentLabelLookup = useCallback((value: string) => employmentLabels[value] ?? value, []);

  return (
    <PageLayout>
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="grid"
        gap={3}
        gridTemplateColumns={{
          xs: "repeat(1, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        }}
        sx={{ alignItems: "start" }}
      >
        <TextField
          label="検索キーワード"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="キーワードを入力"
          fullWidth
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={skillOptions}
          value={selectedSkillOptions}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, selected) => option.value === selected.value}
          onChange={(_, selected) => setSkills(selected.map((option) => option.value))}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip label={option.label} {...getTagProps({ index })} key={option.value} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="スキル"
              placeholder="スキルを選択"
              InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
            />
          )}
        />

        <FormControl fullWidth>
          <InputLabel id="department-select-label">部署</InputLabel>
          <Select
            labelId="department-select-label"
            label="部署"
            multiple
            value={departments}
            onChange={handleDepartmentChange}
            renderValue={(selected) =>
              (selected as string[])
                .map((value) => departmentLabelMap.get(value) ?? value)
                .join(", ")
            }
          >
            {departmentOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={departments.includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="入社日 (以降)"
          type="date"
          value={joinedAfter ?? ""}
          onChange={(event) => setJoinedAfter(event.target.value || null)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <FormControl component="fieldset">
          <FormLabel>並び順</FormLabel>
          <RadioGroup
            row
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            {sortOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Stack spacing={2}>
          <FormControl component="fieldset">
            <FormLabel>特性</FormLabel>
            <FormGroup row>
              {featureOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={features.includes(option.value)}
                      onChange={() => handleFeatureToggle(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isFetching} sx={{ minWidth: 160 }}>
              検索
            </Button>
          </Box>
        </Stack>
      </Box>

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
            {isFetching && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <LoadingSection label="検索中..." />
                </TableCell>
              </TableRow>
            )}

            {!isFetching && !filtersAreMeaningful && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography component="span">条件を入力して検索してください。</Typography>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && filtersAreMeaningful && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography component="span">条件に一致するユーザーが見つかりませんでした。</Typography>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && users.length > 0 &&
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
    </PageLayout>
  );
}

function UsersSearchPageFallback() {
  return (
    <PageLayout>
      <LoadingSection label="条件を読み込み中..." />
      <Paper variant="outlined">
        <LoadingSection label="読み込み中..." />
      </Paper>
    </PageLayout>
  );
}

export default function UsersSearchPageClient(props: UsersSearchPageClientProps) {
  return (
    <Suspense fallback={<UsersSearchPageFallback />}>
      <UsersSearchPageContent {...props} />
    </Suspense>
  );
}
