import type { DepartmentOption, SkillOption } from "@/services/user-filter-options";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  employment: string;
  joinedAt: string;
  skills: string[];
  features: string[];
};

export const USERS_FIXTURE: User[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "taro@example.com",
    department: "development",
    employment: "full-time",
    joinedAt: "2023-05-10",
    skills: ["frontend", "management"],
    features: ["remote", "mentor"],
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "hanako@example.com",
    department: "design",
    employment: "contract",
    joinedAt: "2022-11-01",
    skills: ["design", "frontend"],
    features: ["remote", "leader"],
  },
  {
    id: "3",
    name: "佐藤次郎",
    email: "jiro@example.com",
    department: "sales",
    employment: "full-time",
    joinedAt: "2021-07-15",
    skills: ["backend", "qa"],
    features: ["newgrad"],
  },
];

export const SKILL_OPTIONS: SkillOption[] = [
  { value: "frontend", label: "フロントエンド" },
  { value: "backend", label: "バックエンド" },
  { value: "design", label: "デザイン" },
  { value: "management", label: "マネジメント" },
  { value: "qa", label: "QA" },
];

export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: "sales", label: "営業" },
  { value: "development", label: "開発" },
  { value: "design", label: "デザイン" },
  { value: "hr", label: "人事" },
];
