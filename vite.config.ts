import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// إعداد بسيط ومباشر بدون إضافات Replit
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
