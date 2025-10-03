import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    coverage: {
      provider: "istanbul",
      all: true,
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.{ts,tsx}", "app/api/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
      exclude: ["node_modules/**", "**/*.d.ts", "**/*.test.ts", "**/*.test.tsx", "prisma/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
