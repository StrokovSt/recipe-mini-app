import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

// Встраивает общий CSS прямо в index.html. Отдельный файл стилей блокирует отрисовку
// и на медленной сети качается вместе с JS, а встроенный приходит сразу с HTML
const inlineEntryCss = (): Plugin => ({
  name: "inline-entry-css",
  apply: "build",
  enforce: "post",
  generateBundle(_, bundle) {
    const html = bundle["index.html"];
    if (html?.type !== "asset") return;

    let source = String(html.source);
    for (const [fileName, file] of Object.entries(bundle)) {
      const link = `<link rel="stylesheet" crossorigin href="/${fileName}">`;
      if (file.type !== "asset" || !source.includes(link)) continue;

      source = source.replace(link, `<style>${file.source}</style>`);
      delete bundle[fileName];
    }
    html.source = source;
  },
});

export default defineConfig({
  plugins: [svgr(), react(), inlineEntryCss()],
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