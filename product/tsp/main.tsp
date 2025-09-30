import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";
import "./users.tsp";
import "./filters.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{
  title: "Sample User API",
})
@info(#{
  version: "1.0.0",
})
@route("/api")
namespace SampleApi;
