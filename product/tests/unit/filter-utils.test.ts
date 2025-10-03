import { describe, expect, it } from "vitest";

import {
  hasMeaningfulFilters,
  mapTokensToOptions,
  parseFilters,
  type SearchFilters,
} from "@/app/sample/search/filter-utils";

describe("parseFilters", () => {
  it("returns defaults when no parameters are provided", () => {
    const params = new URLSearchParams();

    const result = parseFilters(params);

    expect(result).toEqual<SearchFilters>({
      keyword: "",
      tokens: [],
      sections: [],
      joinedAfter: null,
      sortOrder: null,
      features: [],
    });
  });

  it("parses provided search parameters", () => {
    const params = new URLSearchParams();
    params.set("q", "token-1");
    params.append("tokens", "token-1");
    params.append("tokens", "token-3");
    params.set("section", "unit-1");
    params.append("sections", "unit-2");
    params.set("joinedAfter", "2022-01-01");
    params.set("sort", "joined-asc");
    params.append("features", "flag-1");
    params.append("features", "flag-2");

    const result = parseFilters(params);

    expect(result.keyword).toBe("token-1");
    expect(result.tokens).toEqual(["token-1", "token-3"]);
    expect(result.sections).toEqual(expect.arrayContaining(["unit-1", "unit-2"]));
    expect(result.sections).toHaveLength(2);
    expect(result.joinedAfter).toBe("2022-01-01");
    expect(result.sortOrder).toBe("joined-asc");
    expect(result.features).toEqual(["flag-1", "flag-2"]);
  });
});

describe("mapTokensToOptions", () => {
  const options = [
    { value: "token-1", label: "コードＡ" },
    { value: "token-2", label: "コードＢ" },
    { value: "token-3", label: "コードＣ" },
  ];

  it("maps selected skill ids to option objects", () => {
    const result = mapTokensToOptions(["token-1", "token-3"], options);

    expect(result).toEqual([
      { value: "token-1", label: "コードＡ" },
      { value: "token-3", label: "コードＣ" },
    ]);
  });

  it("ignores unknown skill ids", () => {
    const result = mapTokensToOptions(["token-1", "unknown"], options);

    expect(result).toEqual([{ value: "token-1", label: "コードＡ" }]);
  });
});

describe("hasMeaningfulFilters", () => {
  const baseFilters: SearchFilters = {
    keyword: "",
    tokens: [],
    sections: [],
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

  it("returns true when tokens are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, tokens: ["token-1"] })).toBe(true);
  });

  it("returns true when sections are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, sections: ["unit-1"] })).toBe(true);
  });

  it("returns true when joinedAfter is provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, joinedAfter: "2022-01-01" })).toBe(true);
  });

  it("returns true when features are provided", () => {
    expect(hasMeaningfulFilters({ ...baseFilters, features: ["flag-1"] })).toBe(true);
  });
});
