import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Filters;

model FilterOption {
  value: string;
  label: string;
}

model FilterOptionsResponse {
  items: FilterOption[];
}

@route("/filters/skills")
@get
op listSkillOptions(): FilterOptionsResponse;

@route("/filters/departments")
@get
op listDepartmentOptions(): FilterOptionsResponse;
