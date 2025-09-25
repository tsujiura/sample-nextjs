export type SearchFilters = {
  keyword: string;
  skills: string[];
  departments: string[];
  joinedAfter: string | null;
  sortOrder: string | null;
  features: string[];
};

export function parseFilters(searchParams: URLSearchParams): SearchFilters {
  const keyword = searchParams.get("q")?.trim() ?? "";
  const skills = searchParams.getAll("skills");
  const departmentsFromRepeated = searchParams.getAll("departments");
  const departmentFallback = searchParams.get("department");
  const departmentsSet = new Set<string>(departmentsFromRepeated);
  if (departmentFallback && departmentFallback.length > 0) {
    departmentsSet.add(departmentFallback);
  }
  const departments = Array.from(departmentsSet);
  const joinedAfter = searchParams.get("joinedAfter");
  const sortOrder = searchParams.get("sort");
  const features = searchParams.getAll("features");

  return {
    keyword,
    skills,
    departments,
    joinedAfter: joinedAfter && joinedAfter.length > 0 ? joinedAfter : null,
    sortOrder: sortOrder && sortOrder.length > 0 ? sortOrder : null,
    features,
  };
}

export function hasMeaningfulFilters(filters: SearchFilters): boolean {
  return (
    (filters.keyword?.length ?? 0) > 0 ||
    filters.skills.length > 0 ||
    filters.departments.length > 0 ||
    Boolean(filters.joinedAfter) ||
    filters.features.length > 0
  );
}

export function mapSkillsToOptions<T extends { value: string }>(
  values: string[],
  options: T[],
): T[] {
  return values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is T => Boolean(option));
}
