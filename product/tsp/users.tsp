import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Users;

alias SortOrder = "joined-asc" | "joined-desc";

model User {
  id: string;
  name: string;
  email: string;
  department: string;
  employment: string;
  joinedAt: string;
  skills: string[];
  features: string[];
}

model UsersResponse {
  users: User[];
}

@route("/users")
@get
op listUsers(
  @query q?: string,
  @query skills?: string[],
  @query departments?: string[],
  @query joinedAfter?: string,
  @query sort?: SortOrder,
  @query features?: string[],
): UsersResponse;
