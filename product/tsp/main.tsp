import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace SampleApi;

model User {
  id: string;
  name: string;
  email: string;
}

model FilterOption {
  value: string;
  label: string;
}

@service(#{
  title: "Sample User API",
})
@info(#{
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

  @route("/users/filters")
  namespace Filters {
    @route("/skills")
    @get
    op listUserSkillOptions(): {
      @statusCode status: 200;
      @body items: FilterOption[];
    };

    @route("/departments")
    @get
    op listUserDepartmentOptions(): {
      @statusCode status: 200;
      @body items: FilterOption[];
    };
  }
}
