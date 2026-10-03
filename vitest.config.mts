import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true }, // lets tests use "@/lib/..." imports
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
