import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths so the build also works from a GitHub Pages subfolder.
  base: "./",
  plugins: [react()],
  worker: { format: "es" },
});
