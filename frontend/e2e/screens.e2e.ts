import { expect, type Page, test } from "@playwright/test";

import { mockApi } from "./api";

// Экраны мобилки в светлой и тёмной теме. Если правка на компьютере задела телефон, картинка разойдётся с эталоном.
// Эталоны обновляются командой npm run test:screens:update, когда изменение задумано

const SCREENS = [
    ["home", "/"],
    ["recipe", "/recipe/r0"],
    ["recipe-missing", "/recipe/none"],
    ["add", "/add"],
    ["import", "/add/import"],
    ["form", "/add/form"],
    ["drafts", "/add/drafts"],
    ["draft", "/add/draft/d1"],
    ["edit", "/edit/r0"],
    ["sections", "/sections"],
    ["profile", "/profile"],
    ["settings", "/settings"],
    ["about", "/about"],
    ["not-found", "/nope"],
] as const;

// Длинные экраны снимаем ещё раз, прокрутив вниз
const LONG_SCREENS = new Set(["home", "recipe", "form", "edit"]);

const THEMES = ["light", "dark"] as const;

const open = async (page: Page, url: string, theme: string) => {
    await page.addInitScript((value) => {
        localStorage.setItem("onboardingDone", "true");
        localStorage.setItem("theme", value);
        localStorage.setItem("TanstackQueryDevtools.open", "false");
    }, theme);
    await mockApi(page);
    await page.goto(url);
    // Заставка ушла, данные пришли, шрифты и картинки на месте
    await page.locator("#splash").waitFor({ state: "detached" });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
};

// Шторка: у самого диалога нулевой размер, видна его панель
const sheet = (page: Page) => page.locator('[id^="headlessui-dialog-panel"]');

// Прокручивается сама страница или её контейнер, смотря по раскладке
const scrollDown = (page: Page) => page.evaluate(() => {
    const target = [...document.querySelectorAll<HTMLElement>("*")].find((element) =>
        element.scrollHeight > element.clientHeight + 100 && ["auto", "scroll"].includes(getComputedStyle(element).overflowY));
    if (target) target.scrollTop = target.clientHeight - 120;
    else window.scrollTo(0, window.innerHeight - 120);
});

for (const theme of THEMES) {
    test.describe(theme, () => {
        for (const [name, url] of SCREENS) {
            test(name, async ({ page }) => {
                await open(page, url, theme);
                await expect(page).toHaveScreenshot(`${theme}-${name}.png`);

                if (LONG_SCREENS.has(name)) {
                    await scrollDown(page);
                    await expect(page).toHaveScreenshot(`${theme}-${name}-scrolled.png`);
                }
            });
        }

        test("filters", async ({ page }) => {
            await open(page, "/", theme);
            await page.locator('[data-onboarding="filter"]').click();
            await expect(sheet(page)).toBeVisible();
            await expect(page).toHaveScreenshot(`${theme}-filters.png`);
        });

        test("menu", async ({ page }) => {
            await open(page, "/", theme);
            await page.locator("header button").last().click();
            await expect(sheet(page)).toBeVisible();
            await expect(page).toHaveScreenshot(`${theme}-menu.png`);
        });

        test("search history", async ({ page }) => {
            await open(page, "/", theme);
            await page.locator('[data-onboarding="search"] input').focus();
            await expect(page).toHaveScreenshot(`${theme}-search-history.png`);
        });

        // Узкий телефон: список в одну колонку, карточки горизонтальные
        test("narrow home", async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 640 });
            await open(page, "/", theme);
            await expect(page).toHaveScreenshot(`${theme}-home-narrow.png`);
        });

        test("recipe actions", async ({ page }) => {
            await open(page, "/recipe/r0", theme);
            await page.locator("header button").first().click();
            await expect(page.getByRole("menu")).toBeVisible();
            await expect(page).toHaveScreenshot(`${theme}-recipe-actions.png`);
        });

        test("steps tab", async ({ page }) => {
            await open(page, "/edit/r0", theme);
            await page.getByRole("radio", { name: "Приготовление" }).click();
            await page.getByRole("radio", { name: "Приготовление" }).scrollIntoViewIfNeeded();
            await expect(page).toHaveScreenshot(`${theme}-steps.png`);
        });

        test("tags tab", async ({ page }) => {
            await open(page, "/sections", theme);
            await page.getByRole("radio", { name: "Теги" }).click();
            await expect(page).toHaveScreenshot(`${theme}-tags.png`);
        });
    });
}
