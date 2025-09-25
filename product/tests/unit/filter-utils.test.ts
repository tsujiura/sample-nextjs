import { describe, expect, it } from "vitest";

import {
  hasMeaningfulFilters,
  mapSkillsToOptions,
  parseFilters,
  type SearchFilters,
} from "@/app/users/search/filter-utils";

describe("parseFilters", () => {
  it("returns defaults when no parameters are provided", () => {
    const params = new URLSearchParams();

    const result = parseFilters(params);

    expect(result).toEqual<SearchFilters>({
      keyword: "",
      skills: [],
      departments: [],
      joinedAfter: null,
      sortOrder: null,
      features: [],
    });
  });

  it("parses provided search parameters", () => {
    const params = new URLSearchParams();
    params.set("q", "frontend");
    params.append("skills", "frontend");
    params.append("skills", "qa");
    params.set("department", "development");
    params.append("departments", "design");
    params.set("joinedAfter", "2022-01-01");
    params.set("sort", "joined-asc");
    params.append("features", "remote");
    params.append("features", "mentor");

    const result = parseFilters(params);

    expect(result.keyword).toBe("frontend");
    expect(result.skills).toEqual(["frontend", "qa"]);
    expect(result.departments).toEqual(expect.arrayContaining(["development", "design"]));
    expect(result.departments).toHaveLength(2);
    expect(result.joinedAfter).toBe("2022-01-01");
    expect(result.sortOrder).toBe("joined-asc");
    expect(result.features).toEqual(["remote", "mentor"]);
  });
});

describe("mapSkillsToOptions", () => {
  const options = [
    { value: "frontend", label: "フロントエンド" },
    { value: "backend", label: "バックエンド" },
    { value: "qa", label: "QA" },
  ];

  it("maps selected skill ids to option objects", () => {
    const result = mapSkillsToOptions(["frontend", "qa"], options);

    expect(result).toEqual([
      { value: "frontend", label: "フロントエンド" },
      { value: "qa", label: "QA" },
    ]);
  });

  it("ignores unknown skill ids", () => {
    const result = mapSkillsToOptions(["frontend", "unknown"], options);

    expect(result).toEqual([{ value: "frontend", label: "フロントエンド" }]);
  });
});

describe("hasMeaningfulFilters", () => {
  const baseFilters: SearchFilters = {
    keyword: "",
    skills: [],
    departments: [],
    joinedAfter: null,
    sortOrder: null,
    features: [],
  };

  it("returns false when all filters are empty", () => {
    expect(hasMeaningfulFilters(baseFilters)).toBe(false);
  });

  it("returns true when keyword is provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, keyword: "foo" })).toBe(true);
  });

  it("returns true when skills are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, skills: ["frontend"] })).toBe(true);
  });

  it("returns true when departments are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, departments: ["development"] })).toBe(true);
  });

  it("returns true when joinedAfter is provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, joinedAfter: "2022-01-01" })).toBe(true);
  });

  it("returns true when features are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, features: ["remote"] })).toBe(true);
  });
});
