import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

namespace SampleApi;

model User {
  id: string;
  name: string;
  email: string;
}

@service({
  title: "Sample User API",
  version: "1.0.0",
})
@route("/api")
namespace UsersService {
  @route("/users")
  @get
  op listUsers(@query q?: string): {
    @statusCode status: 200;
    @body users: User[];
  };
}
