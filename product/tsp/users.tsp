import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Users;

model User {
  id: string;
  name: string;
  email: string;
}

@route("/users")
@get
op listUsers(@query q?: string): {
  @statusCode status: 200;
  @body users: User[];
};
