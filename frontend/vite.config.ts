import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
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

// Код приложения начинает качаться, когда печать на заставке уже на экране: браузер отметил её как LCP
// (в Safari такой отметки нет — когда печать загрузилась). Иначе код (около 150 КБ) делит сеть с печатью,
// и она появляется позже. Без заставки (компьютер) — сразу. 1500 мс — как MAX_SEAL_WAIT_MS в shared/lib/splash
const startAppScript = (src: string) => `(() => {
  let isStarted = false;
  const start = () => {
    if (isStarted) return;
    isStarted = true;
    const script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "";
    script.src = "${src}";
    document.head.append(script);
  };
  const splash = document.getElementById("splash");
  const seal = splash && splash.querySelector(".splash-seal");
  if (!seal || getComputedStyle(splash).display === "none") return start();
  if ((PerformanceObserver.supportedEntryTypes || []).includes("largest-contentful-paint")) {
    new PerformanceObserver(start).observe({ type: "largest-contentful-paint", buffered: true });
  } else {
    if (seal.complete) start();
    seal.addEventListener("load", start);
  }
  seal.addEventListener("error", start);
  setTimeout(start, 1500);
})()`;

// Только для сборки: на dev-сервере main.tsx подключается как обычно
const startAppAfterSeal = (): Plugin => ({
  name: "start-app-after-seal",
  apply: "build",
  enforce: "post",
  generateBundle(_, bundle) {
    const html = bundle["index.html"];
    if (html?.type !== "asset") return;

    const source = String(html.source);
    const entry = source.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
    if (!entry) return;

    const [tag, src] = entry;
    html.source = source.replace(tag, "").replace("</body>", `<script>${startAppScript(src)}</script></body>`);
  },
});

const MONTH = 60 * 60 * 24 * 30;

// Service worker: код приложения хранится на устройстве (повторный запуск без сети и почти мгновенно),
// рецепты и фото, которые уже открывали, видны офлайн. Регистрация в shared/lib/pwa
const pwa = () => VitePWA({
  injectRegister: false,
  registerType: "autoUpdate",
  // Манифест свой, в public/manifest.webmanifest
  manifest: false,
  workbox: {
    // Шрифты, картинки и видео сюда не входят: качаются только те, что реально понадобились (ниже)
    globPatterns: ["**/*.{js,css,html,ico}"],
    navigateFallback: "index.html",
    navigateFallbackDenylist: [/^\/api\//],
    // Новая версия берёт управление сразу, без перезагрузки: человек увидит её при следующем запуске
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        // Данные: всегда свежие из сети, без сети — последний сохранённый ответ. Вход (/api/auth) мимо service worker
        urlPattern: ({ url, request }) =>
          request.method === "GET" && url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api",
          expiration: { maxEntries: 200, maxAgeSeconds: MONTH },
          cacheableResponse: { statuses: [200] },
        },
      },
      {
        // Фото рецептов не меняются по одному адресу, поэтому сначала берём с устройства
        urlPattern: ({ url }) => url.hostname === "res.cloudinary.com" || url.hostname === "i.pinimg.com",
        handler: "CacheFirst",
        options: {
          cacheName: "photos",
          expiration: { maxEntries: 150, maxAgeSeconds: MONTH, purgeOnQuotaError: true },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: ({ request, sameOrigin }) => sameOrigin && ["font", "image"].includes(request.destination),
        handler: "CacheFirst",
        options: {
          cacheName: "assets",
          expiration: { maxEntries: 100, maxAgeSeconds: MONTH },
        },
      },
    ],
  },
});

export default defineConfig({
  plugins: [svgr({
    svgrOptions: {
      plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      svgoConfig: { plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false } } }, "prefixIds"] },
    },
  }), react(), inlineEntryCss(), startAppAfterSeal(), pwa()],
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