"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import axiosInstance from "@/api-client/axios-instance";
import type {
  DepartmentOption,
  SkillOption,
} from "@/services/user-filter-options";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  employment: string;
  joinedAt: string;
};

type UsersResponse = {
  users: User[];
};

type UsersSearchPageClientProps = {
  skillOptions: SkillOption[];
  departmentOptions: DepartmentOption[];
};

type SearchFilters = {
  keyword: string;
  skills: string[];
  department: string | null;
  joinedAfter: string | null;
  sortOrder: string | null;
  features: string[];
};

const sortOptions = [
  { value: "joined-desc", label: "参加日が新しい順" },
  { value: "joined-asc", label: "参加日が古い順" },
];

const featureOptions = [
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

function parseFilters(searchParams: URLSearchParams): SearchFilters {
  const keyword = searchParams.get("q")?.trim() ?? "";
  const skills = searchParams.getAll("skills");
  const department = searchParams.get("department");
  const joinedAfter = searchParams.get("joinedAfter");
  const sortOrder = searchParams.get("sort");
  const features = searchParams.getAll("features");

  return {
    keyword,
    skills,
    department: department && department.length > 0 ? department : null,
    joinedAfter: joinedAfter && joinedAfter.length > 0 ? joinedAfter : null,
    sortOrder: sortOrder && sortOrder.length > 0 ? sortOrder : null,
    features,
  };
}

function mapSkillsToOptions(
  values: string[],
  options: SkillOption[],
): SkillOption[] {
  return values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is SkillOption => Boolean(option));
}

async function fetchUsers(filters: SearchFilters): Promise<User[]> {
  const response = await axiosInstance.get<UsersResponse>("/api/users", {
    params: {
      q: filters.keyword,
      skills: filters.skills,
      department: filters.department ?? undefined,
      joinedAfter: filters.joinedAfter ?? undefined,
      sort: filters.sortOrder ?? undefined,
      features: filters.features,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data.users;
}

function UsersSearchPageContent({
  skillOptions,
  departmentOptions,
}: UsersSearchPageClientProps) {
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
  const [department, setDepartment] = useState<string | null>(
    filterState.department,
  );
  const [joinedAfter, setJoinedAfter] = useState<string | null>(
    filterState.joinedAfter,
  );
  const [sortOrder, setSortOrder] = useState<string | null>(
    filterState.sortOrder ?? sortOptions[0]?.value ?? null,
  );
  const [features, setFeatures] = useState<string[]>(filterState.features);

  useEffect(() => {
    setKeyword(filterState.keyword);
    setSkills(filterState.skills);
    setDepartment(filterState.department);
    setJoinedAfter(filterState.joinedAfter);
    setSortOrder(filterState.sortOrder ?? sortOptions[0]?.value ?? null);
    setFeatures(filterState.features);
  }, [filterState]);

  const hasMeaningfulFilters = useMemo(() => {
    return (
      (filterState.keyword?.length ?? 0) > 0 ||
      filterState.skills.length > 0 ||
      Boolean(filterState.department) ||
      Boolean(filterState.joinedAfter) ||
      filterState.features.length > 0
    );
  }, [filterState]);

  const departmentLabelMap = useMemo(() => {
    return new Map(departmentOptions.map((option) => [option.value, option.label]));
  }, [departmentOptions]);

  const queryKey = useMemo(
    () => [
      "users",
      filterState.keyword,
      [...filterState.skills].sort().join(","),
      filterState.department ?? "",
      filterState.joinedAfter ?? "",
      filterState.sortOrder ?? "",
      [...filterState.features].sort().join(","),
    ],
    [filterState],
  );

  const { data: users = [], isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchUsers(filterState),
    enabled: hasMeaningfulFilters,
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

      if (department) {
        params.set("department", department);
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
    [keyword, skills, department, joinedAfter, sortOrder, features, pathname, router],
  );

  const selectedSkillOptions = useMemo(
    () => mapSkillsToOptions(skills, skillOptions),
    [skills, skillOptions],
  );

  const handleFeatureToggle = useCallback(
    (featureValue: string) => {
      setFeatures((current) => {
        if (current.includes(featureValue)) {
          return current.filter((value) => value !== featureValue);
        }

        return [...current, featureValue];
      });
    },
    [],
  );

  return (
    <Stack spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Users 検索
        </Typography>
        <Typography color="text.secondary">
          複数の条件を組み合わせてユーザーを検索できます。
        </Typography>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "repeat(1, minmax(0, 1fr))",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        <Box sx={{ gridColumn: { xs: "span 1", md: "span 2", xl: "span 1" } }}>
          <TextField
            fullWidth
            label="検索キーワード"
            name="q"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </Box>

        <FormControl
          fullWidth
          sx={{ gridColumn: { xs: "span 1", md: "span 2", xl: "span 1" } }}
        >
          <Autocomplete
            multiple
            disableCloseOnSelect
            value={selectedSkillOptions}
            options={skillOptions}
            onChange={(_, value) => {
              setSkills(value.map((option) => option.value));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option.label} {...getTagProps({ index })} key={option.value} />
              ))
            }
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField {...params} label="スキル" placeholder="スキルを選択" />
            )}
          />
        </FormControl>

        <FormControl
          fullWidth
          sx={{ gridColumn: { xs: "span 1", md: "span 1" } }}
        >
          <InputLabel id="department-select-label">部署</InputLabel>
          <Select
            labelId="department-select-label"
            value={department ?? ""}
            label="部署"
            onChange={(event) => {
              const value = event.target.value;
              setDepartment(value === "" ? null : String(value));
            }}
          >
            <MenuItem value="">
              <em>指定なし</em>
            </MenuItem>
            {departmentOptions.map((option) => (
              <MenuItem value={option.value} key={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ gridColumn: { xs: "span 1", md: "span 1" } }}>
          <TextField
            fullWidth
            label="入社日 (以降)"
            type="date"
            value={joinedAfter ?? ""}
            onChange={(event) => {
              const nextValue = event.target.value;
              setJoinedAfter(nextValue.length > 0 ? nextValue : null);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <FormControl
          component="fieldset"
          sx={{ gridColumn: { xs: "span 1", md: "span 1" } }}
        >
          <FormLabel id="sort-order-label">並び順</FormLabel>
          <RadioGroup
            row
            aria-labelledby="sort-order-label"
            value={sortOrder ?? sortOptions[0]?.value ?? ""}
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

        <FormControl
          component="fieldset"
          sx={{ gridColumn: { xs: "span 1", md: "span 2", xl: "span 3" } }}
        >
          <FormLabel component="legend">特性</FormLabel>
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

        <Stack
          direction="row"
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
          sx={{ gridColumn: { xs: "span 1", md: "span 2", xl: "span 3" } }}
        >
          <Button type="submit" variant="contained" sx={{ minWidth: 160 }}>
            検索
          </Button>
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
                  <Stack alignItems="center" direction="row" justifyContent="center" spacing={2}>
                    <CircularProgress size={24} />
                    <span>検索中...</span>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && !hasMeaningfulFilters && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  条件を入力して検索してください。
                </TableCell>
              </TableRow>
            )}

            {!isFetching && hasMeaningfulFilters && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  条件に一致するユーザーが見つかりませんでした。
                </TableCell>
              </TableRow>
            )}

            {!isFetching &&
              users.length > 0 &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{departmentLabelMap.get(user.department) ?? user.department}</TableCell>
                  <TableCell>{employmentLabels[user.employment] ?? user.employment}</TableCell>
                  <TableCell>{user.joinedAt}</TableCell>
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
              <TableCell colSpan={5} align="center">
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

export default function UsersSearchPageClient(props: UsersSearchPageClientProps) {
  return (
    <Suspense fallback={<UsersSearchPageFallback />}>
      <UsersSearchPageContent {...props} />
    </Suspense>
  );
}
