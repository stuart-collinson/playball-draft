import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
  ssr: {
    resolve: {
      conditions: ["react-server", "node", "import", "default"],
    },
  },
  resolve: {
    alias: { "@pbd": path.resolve(__dirname, "src") },
  },
});
