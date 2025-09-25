import { defineConfig } from "orval";

export default defineConfig({
  users: {
    input: {
      target: "./openapi/openapi.json",
    },
    output: {
      target: "./src/api-client/generated.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/api-client/axios-instance.ts",
          name: "axiosInstance",
        },
      },
    },
  },
});
