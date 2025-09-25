export type SkillOption = {
  value: string;
  label: string;
};

export type DepartmentOption = {
  value: string;
  label: string;
};

const SKILL_OPTIONS: SkillOption[] = [
  { value: "frontend", label: "フロントエンド" },
  { value: "backend", label: "バックエンド" },
  { value: "design", label: "デザイン" },
  { value: "management", label: "マネジメント" },
  { value: "qa", label: "QA" },
];

const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: "sales", label: "営業" },
  { value: "development", label: "開発" },
  { value: "design", label: "デザイン" },
  { value: "hr", label: "人事" },
];

export async function getSkillOptions(): Promise<SkillOption[]> {
  return [...SKILL_OPTIONS];
}

export async function getDepartmentOptions(): Promise<DepartmentOption[]> {
  return [...DEPARTMENT_OPTIONS];
}
