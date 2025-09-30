import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Filters;

model FilterOption {
  value: string;
  label: string;
}

@route("/filters/skills")
@get
op listSkillOptions(): {
  @statusCode status: 200;
  @body items: FilterOption[];
};

@route("/filters/departments")
@get
op listDepartmentOptions(): {
  @statusCode status: 200;
  @body items: FilterOption[];
};
