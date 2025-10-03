export type SearchFilters = {
  keyword: string;
  tokens: string[];
  sections: string[];
  joinedAfter: string | null;
  sortOrder: string | null;
  features: string[];
};

export function parseFilters(searchParams: URLSearchParams): SearchFilters {
  const keyword = searchParams.get("q")?.trim() ?? "";
  const tokens = searchParams.getAll("tokens");
  const sectionsFromRepeated = searchParams.getAll("sections");
  const sectionFallback = searchParams.get("section");
  const sectionsSet = new Set<string>(sectionsFromRepeated);
  if (sectionFallback && sectionFallback.length > 0) {
    sectionsSet.add(sectionFallback);
  }
  const sections = Array.from(sectionsSet);
  const joinedAfter = searchParams.get("joinedAfter");
  const sortOrder = searchParams.get("sort");
  const features = searchParams.getAll("features");

  return {
    keyword,
    tokens,
    sections,
    joinedAfter: joinedAfter && joinedAfter.length > 0 ? joinedAfter : null,
    sortOrder: sortOrder && sortOrder.length > 0 ? sortOrder : null,
    features,
  };
}

export function hasMeaningfulFilters(filters: SearchFilters): boolean {
  return (
    (filters.keyword?.length ?? 0) > 0 ||
    filters.tokens.length > 0 ||
    filters.sections.length > 0 ||
    Boolean(filters.joinedAfter) ||
    filters.features.length > 0
  );
}

export function mapTokensToOptions<T extends { value: string }>(
  values: string[],
  options: T[],
): T[] {
  return values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is T => Boolean(option));
}
