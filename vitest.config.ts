import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig.json impose `jsx: "preserve"` (exigé par Next.js) : sans ce
  // réglage, Vite laisserait le JSX tel quel et tout test de composant
  // échouerait à l'analyse. Vite 8 compile avec Oxc (l'ancienne option
  // `esbuild` est ignorée).
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});
