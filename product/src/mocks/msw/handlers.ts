import { http, HttpResponse } from "msw";

import { ENV } from "@/config/env";
import {
  DEPARTMENT_OPTIONS,
  SKILL_OPTIONS,
  USERS_FIXTURE,
} from "./data/users";

const usersEndpoint = new URL("/api/users", ENV.apiBaseUrl).toString();
const departmentFiltersEndpoint = new URL(
  "/api/filters/departments",
  ENV.apiBaseUrl,
).toString();
const skillFiltersEndpoint = new URL("/api/filters/skills", ENV.apiBaseUrl).toString();

export const handlers = [
  http.get(usersEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("q") ?? "";
    const normalizedKeyword = keyword.trim();
    const normalizedKeywordLower = normalizedKeyword.toLowerCase();

    const skills = url.searchParams.getAll("skills");
    const departments = url.searchParams.getAll("departments");
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
        departments.length === 0 || departments.includes(user.department);

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
  http.get(skillFiltersEndpoint, () => {
    return HttpResponse.json({ items: [...SKILL_OPTIONS] });
  }),
  http.get(departmentFiltersEndpoint, () => {
    return HttpResponse.json({ items: [...DEPARTMENT_OPTIONS] });
  }),
];
