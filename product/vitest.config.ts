import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    css: true,
    deps: {
      optimizer: {
        web: {
          include: [
            "@mui/material",
            "@mui/icons-material",
            "@mui/material-nextjs",
            "@emotion/react",
            "@emotion/styled",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
