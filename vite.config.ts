import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Static hosts serve 404.html for unknown paths, which lets deep links load the app. */
function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    apply: "build",
    closeBundle() {
      copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
    },
  };
}

export default defineConfig({
  // Use BASE_PATH=/inner-joy/ when publishing to a GitHub Pages subfolder.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), spaFallback()],
  worker: { format: "es" },
});
