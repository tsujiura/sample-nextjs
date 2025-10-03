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

import { ItemsListSampleItemsSort, getSampleItemAPI } from "@/api-client/generated";
import { hasMeaningfulFilters, parseFilters, type SearchFilters } from "@/app/sample/search/filter-utils";
import type { SectionOption, TokenOption } from "@/services/sample-filter-options";

type FooChoice = {
  value: string;
  label: string;
};

type BarChoice = {
  value: string;
  label: string;
};

type BazRow = {
  id: string;
  name: string;
  email: string;
  segment: string;
  employment: string;
  joinedAt: string;
};

type SamplePageProps = {
  tokenOptions: TokenOption[];
  sectionOptions: SectionOption[];
};

const quxClient = getSampleItemAPI();

const fooSortList: FooChoice[] = [
  { value: "joined-desc", label: "サンプル１" },
  { value: "joined-asc", label: "サンプル２" },
];

const barFeatureList: BarChoice[] = [
  { value: "flag-1", label: "チェックボックス１" },
  { value: "flag-2", label: "チェックボックス２" },
  { value: "flag-3", label: "チェックボックス３" },
  { value: "flag-4", label: "チェックボックス４" },
];

const bazEmploymentMap: Record<string, string> = {
  "type-alpha": "ラベル１",
  "type-beta": "ラベル２",
  "type-gamma": "ラベル３",
};

async function fetchSampleRows(filters: SearchFilters): Promise<BazRow[]> {
  const mappedSort = mapSortPlaceholder(filters.sortOrder);

  const response = await quxClient.itemsListSampleItems({
    q: filters.keyword,
    tokens: filters.tokens,
    sections: filters.sections,
    joinedAfter: filters.joinedAfter ?? undefined,
    sort: mappedSort,
    features: filters.features,
  });

  return response.data.items.map((entry) => ({
    id: entry.id,
    name: entry.name,
    email: entry.email,
    segment: entry.segment,
    employment: entry.employment,
    joinedAt: entry.joinedAt,
  }));
}

function mapSortPlaceholder(value: string | null): ItemsListSampleItemsSort | undefined {
  if (value === ItemsListSampleItemsSort["joined-asc"] || value === ItemsListSampleItemsSort["joined-desc"]) {
    return value;
  }

  return undefined;
}

function SampleWrapper({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Stack spacing={1}>
        <Typography variant="h4" component="h1">
          サンプル画面
        </Typography>
        <Typography variant="body1" color="text.secondary">
          サンプルの説明テキストです。
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

function SampleLoader({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
      <CircularProgress size={20} aria-label={label} />
      <Typography component="span">{label}</Typography>
    </Stack>
  );
}

function SampleBody({ tokenOptions, sectionOptions }: SamplePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";

  const filters = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    return parseFilters(params);
  }, [searchParamsString]);

  const [valueOne, setValueOne] = useState(filters.keyword);
  const [valueTwo, setValueTwo] = useState<string[]>(filters.tokens);
  const [valueThree, setValueThree] = useState<string[]>(filters.sections);
  const [valueFour, setValueFour] = useState<string | null>(filters.joinedAfter);
  const [valueFive, setValueFive] = useState<string>(filters.sortOrder ?? fooSortList[0]?.value ?? "joined-desc");
  const [valueSix, setValueSix] = useState<string[]>(filters.features);

  useEffect(() => {
    setValueOne(filters.keyword);
    setValueTwo(filters.tokens);
    setValueThree(filters.sections);
    setValueFour(filters.joinedAfter);
    setValueFive(filters.sortOrder ?? fooSortList[0]?.value ?? "joined-desc");
    setValueSix(filters.features);
  }, [filters]);

  const hasUsefulFilters = useMemo(() => hasMeaningfulFilters(filters), [filters]);

  const sectionLabels = useMemo(
    () => new Map(sectionOptions.map((item) => [item.value, item.label])),
    [sectionOptions],
  );

  const selectedTokenItems = useMemo(
    () => tokenOptions.filter((item) => valueTwo.includes(item.value)),
    [tokenOptions, valueTwo],
  );

  const queryKey = useMemo(
    () => [
      "samples",
      filters.keyword,
      [...filters.tokens].sort().join(","),
      [...filters.sections].sort().join(","),
      filters.joinedAfter ?? "",
      filters.sortOrder ?? "",
      [...filters.features].sort().join(","),
    ],
    [filters],
  );

  const { data: records = [], isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchSampleRows(filters),
    enabled: hasUsefulFilters,
    staleTime: 0,
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const params = new URLSearchParams();
      const trimmed = valueOne.trim();

      if (trimmed.length > 0) {
        params.set("q", trimmed);
      }

      if (valueTwo.length > 0) {
        valueTwo.forEach((item) => params.append("tokens", item));
      }

      if (valueThree.length > 0) {
        valueThree.forEach((item) => params.append("sections", item));
      }

      if (valueFour) {
        params.set("joinedAfter", valueFour);
      }

      if (valueFive) {
        params.set("sort", valueFive);
      }

      if (valueSix.length > 0) {
        valueSix.forEach((item) => params.append("features", item));
      }

      const nextSearch = params.toString();
      const nextUrl = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [valueOne, valueTwo, valueThree, valueFour, valueFive, valueSix, pathname, router],
  );

  const handleFeatureToggle = useCallback((value: string) => {
    setValueSix((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }, []);

  const handleSectionChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const next = event.target.value;
      setValueThree(typeof next === "string" ? next.split(",") : next);
    },
    [],
  );

  const sectionLookup = useCallback((value: string) => sectionLabels.get(value) ?? value, [sectionLabels]);
  const employmentLookup = useCallback((value: string) => bazEmploymentMap[value] ?? value, []);

  return (
    <SampleWrapper>
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: "repeat(1, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }}
        sx={{ alignItems: "start" }}
      >
        <TextField
          label="項目１"
          value={valueOne}
          onChange={(event) => setValueOne(event.target.value)}
          placeholder="テキストボックス"
          fullWidth
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={tokenOptions}
          value={selectedTokenItems}
          getOptionLabel={(item) => item.label}
          isOptionEqualToValue={(option, selected) => option.value === selected.value}
          onChange={(_, selected) => setValueTwo(selected.map((item) => item.value))}
          renderTags={(selected, getTagProps) =>
            selected.map((item, index) => <Chip label={item.label} {...getTagProps({ index })} key={item.value} />)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="項目２"
              placeholder="サンプル２"
              InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
            />
          )}
        />

        <FormControl fullWidth>
          <InputLabel id="sample-section-label">項目３</InputLabel>
          <Select
            labelId="sample-section-label"
            label="項目３"
            multiple
            value={valueThree}
            onChange={handleSectionChange}
            renderValue={(selected) =>
              (selected as string[])
                .map((entry) => sectionLabels.get(entry) ?? entry)
                .join(", ")
            }
          >
            {sectionOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <Checkbox checked={valueThree.includes(item.value)} />
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="項目４"
          type="date"
          value={valueFour ?? ""}
          onChange={(event) => setValueFour(event.target.value || null)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <FormControl component="fieldset">
          <FormLabel>サンプル選択</FormLabel>
          <RadioGroup row value={valueFive} onChange={(event) => setValueFive(event.target.value)}>
            {fooSortList.map((item) => (
              <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} />
            ))}
          </RadioGroup>
        </FormControl>

        <Stack spacing={2}>
          <FormControl component="fieldset">
            <FormLabel>チェック項目</FormLabel>
            <FormGroup row>
              {barFeatureList.map((item) => (
                <FormControlLabel
                  key={item.value}
                  control={<Checkbox checked={valueSix.includes(item.value)} onChange={() => handleFeatureToggle(item.value)} />}
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isFetching} sx={{ minWidth: 160 }}>
              実行
            </Button>
          </Box>
        </Stack>
      </Box>

      <Paper variant="outlined">
        <Table aria-label="サンプル一覧">
          <TableHead>
            <TableRow>
              <TableCell>データ１</TableCell>
              <TableCell>データ２</TableCell>
              <TableCell>データ３</TableCell>
              <TableCell>データ４</TableCell>
              <TableCell>データ５</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <SampleLoader label="サンプルローディング" />
                </TableCell>
              </TableRow>
            )}

            {!isFetching && !hasUsefulFilters && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography component="span">サンプルメッセージ</Typography>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && hasUsefulFilters && records.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography component="span">サンプル無し</Typography>
                </TableCell>
              </TableRow>
            )}

            {!isFetching && records.length > 0 &&
              records.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{sectionLookup(row.segment)}</TableCell>
                  <TableCell>{employmentLookup(row.employment)}</TableCell>
                  <TableCell>{row.joinedAt}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </SampleWrapper>
  );
}

function SamplePlaceholder() {
  return (
    <SampleWrapper>
      <SampleLoader label="サンプルローディング" />
      <Paper variant="outlined">
        <SampleLoader label="サンプルローディング" />
      </Paper>
    </SampleWrapper>
  );
}

export default function SamplePageClient(props: SamplePageProps) {
  return (
    <Suspense fallback={<SamplePlaceholder />}>
      <SampleBody {...props} />
    </Suspense>
  );
}
