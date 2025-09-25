import { http, HttpResponse } from "msw";

import { ENV } from "@/config/env";

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

const USERS_FIXTURE: User[] = [
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

const usersEndpoint = new URL("/api/users", ENV.apiBaseUrl).toString();

export const handlers = [
  http.get(usersEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("q") ?? "";
    const normalizedKeyword = keyword.trim();
    const normalizedKeywordLower = normalizedKeyword.toLowerCase();

    const skills = url.searchParams.getAll("skills");
    const department = url.searchParams.get("department") ?? "";
    const joinedAfter = url.searchParams.get("joinedAfter") ?? "";
    const sortOrder = url.searchParams.get("sort") ?? "joined-desc";
    const features = url.searchParams.getAll("features");

    let users = USERS_FIXTURE.filter((user) => {
      const emailLower = user.email.toLowerCase();
      const matchesKeyword = normalizedKeyword.length === 0
        ? true
        : user.name.includes(normalizedKeyword) ||
          user.id.includes(normalizedKeyword) ||
          emailLower.includes(normalizedKeywordLower);

      const matchesSkills =
        skills.length === 0 || skills.every((skill) => user.skills.includes(skill));

      const matchesDepartment =
        department.length === 0 || user.department === department;

      const matchesJoinedAfter =
        joinedAfter.length === 0 || user.joinedAt >= joinedAfter;

      const matchesFeatures =
        features.length === 0 || features.every((feature) => user.features.includes(feature));

      return (
        matchesKeyword &&
        matchesSkills &&
        matchesDepartment &&
        matchesJoinedAfter &&
        matchesFeatures
      );
    });

    users = [...users].sort((a, b) => {
      if (sortOrder === "joined-asc") {
        return a.joinedAt.localeCompare(b.joinedAt);
      }

      return b.joinedAt.localeCompare(a.joinedAt);
    });

    return HttpResponse.json({ users });
  }),
];
