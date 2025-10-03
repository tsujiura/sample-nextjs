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

@route("/filters/tokens")
@get
op listTokenOptions(): FilterOptionsResponse;

@route("/filters/sections")
@get
op listSectionOptions(): FilterOptionsResponse;
