import type { SectionOption, TokenOption } from "@/services/sample-filter-options";

type SampleRecord = {
  id: string;
  name: string;
  email: string;
  segment: string;
  employment: string;
  joinedAt: string;
  tokens: string[];
  features: string[];
};

export const SAMPLE_FIXTURE: SampleRecord[] = [
  {
    id: "foo-1",
    name: "サンプルＡ",
    email: "foo@example.test",
    segment: "unit-1",
    employment: "type-alpha",
    joinedAt: "2023-05-10",
    tokens: ["token-1", "token-4"],
    features: ["flag-1", "flag-2"],
  },
  {
    id: "bar-2",
    name: "サンプルＢ",
    email: "bar@example.test",
    segment: "unit-2",
    employment: "type-beta",
    joinedAt: "2022-11-01",
    tokens: ["token-2", "token-1"],
    features: ["flag-1", "flag-3"],
  },
  {
    id: "baz-3",
    name: "サンプルＣ",
    email: "baz@example.test",
    segment: "unit-3",
    employment: "type-alpha",
    joinedAt: "2021-07-15",
    tokens: ["token-3", "token-5"],
    features: ["flag-4"],
  },
];

export const TOKEN_OPTIONS: TokenOption[] = [
  { value: "token-1", label: "コードＡ" },
  { value: "token-2", label: "コードＢ" },
  { value: "token-3", label: "コードＣ" },
  { value: "token-4", label: "コードＤ" },
  { value: "token-5", label: "コードＥ" },
];

export const SECTION_OPTIONS: SectionOption[] = [
  { value: "unit-1", label: "セクションＡ" },
  { value: "unit-2", label: "セクションＢ" },
  { value: "unit-3", label: "セクションＣ" },
  { value: "unit-4", label: "セクションＤ" },
];
