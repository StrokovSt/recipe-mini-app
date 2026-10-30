import { defineConfig } from "@playwright/test";

const PORT = 5180;

// Скриншот-тесты мобилки: каждый экран сверяется с эталонной картинкой из e2e/__screenshots__.
// Сервер не нужен: ответы API подменяются в e2e/api.ts
export default defineConfig({
    testDir: "./e2e",
    testMatch: "*.e2e.ts",
    snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
    fullyParallel: true,
    reporter: [["list"], ["html", { open: "never" }]],
    expect: {
        // Точка считается изменённой даже при слабой разнице цвета (бледные пилюли, рамки). До 50 таких точек — сглаживание, не поломка
        toHaveScreenshot: { threshold: 0.05, maxDiffPixels: 50, animations: "disabled", caret: "hide" },
    },
    use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
        locale: "ru-RU",
        timezoneId: "Europe/Moscow",
        baseURL: `http://localhost:${PORT}`,
    },
    webServer: {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
    },
});
