import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Items;

alias ItemSort = "joined-asc" | "joined-desc";

model SampleItem {
  id: string;
  name: string;
  email: string;
  segment: string;
  employment: string;
  joinedAt: string;
  tokens: string[];
  features: string[];
}

model SampleItemsResponse {
  items: SampleItem[];
}

@route("/fizz")
@get
op listSampleItems(
  @query q?: string,
  @query tokens?: string[],
  @query sections?: string[],
  @query joinedAfter?: string,
  @query sort?: ItemSort,
  @query features?: string[],
): SampleItemsResponse;
