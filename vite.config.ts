import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// نبني من مجلد client ونخرج إلى dist/client
export default defineConfig({
  root: "client",
  plugins: [react()],
  build: {
    outDir: resolve(process.cwd(), "dist/client"),
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
});
