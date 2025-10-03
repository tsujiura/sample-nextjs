import { http, HttpResponse } from "msw";

import { ENV } from "@/config/env";
import { SECTION_OPTIONS, TOKEN_OPTIONS, SAMPLE_FIXTURE } from "./data/sample";

const sampleEndpoint = new URL("/api/fizz", ENV.apiBaseUrl).toString();
const departmentFiltersEndpoint = new URL(
  "/api/filters/sections",
  ENV.apiBaseUrl,
).toString();
const skillFiltersEndpoint = new URL("/api/filters/tokens", ENV.apiBaseUrl).toString();

export const handlers = [
  http.get(sampleEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("q") ?? "";
    const normalizedKeyword = keyword.trim();
    const normalizedKeywordLower = normalizedKeyword.toLowerCase();

    const tokens = url.searchParams.getAll("tokens");
    const sections = url.searchParams.getAll("sections");
    const joinedAfter = url.searchParams.get("joinedAfter") ?? "";
    const sortOrder = url.searchParams.get("sort") ?? "joined-desc";
    const features = url.searchParams.getAll("features");

    let records = SAMPLE_FIXTURE.filter((entry) => {
      const emailLower = entry.email.toLowerCase();
      const matchesKeyword = normalizedKeyword.length === 0
        ? true
        : entry.name.includes(normalizedKeyword) ||
          entry.id.includes(normalizedKeyword) ||
          emailLower.includes(normalizedKeywordLower);

      const matchesSkills =
        tokens.length === 0 || tokens.every((token) => entry.tokens.includes(token));

      const matchesDepartment =
        sections.length === 0 || sections.includes(entry.segment);

      const matchesJoinedAfter =
        joinedAfter.length === 0 || entry.joinedAt >= joinedAfter;

      const matchesFeatures =
        features.length === 0 || features.every((feature) => entry.features.includes(feature));

      return (
        matchesKeyword &&
        matchesSkills &&
        matchesDepartment &&
        matchesJoinedAfter &&
        matchesFeatures
      );
    });

    records = [...records].sort((a, b) => {
      if (sortOrder === "joined-asc") {
        return a.joinedAt.localeCompare(b.joinedAt);
      }

      return b.joinedAt.localeCompare(a.joinedAt);
    });

    return HttpResponse.json({ items: records });
  }),
  http.get(skillFiltersEndpoint, () => {
    return HttpResponse.json({ items: [...TOKEN_OPTIONS] });
  }),
  http.get(departmentFiltersEndpoint, () => {
    return HttpResponse.json({ items: [...SECTION_OPTIONS] });
  }),
];
