import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

export default defineConfig({
  plugins: [svgr(), react()],
  css: {
    devSourcemap: true,
  },
  server: {
    // Доступ с других устройств в локальной сети (телефон): http://<IP компьютера>:5173
    host: true,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});