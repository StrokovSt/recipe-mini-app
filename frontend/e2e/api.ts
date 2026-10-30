import type { Page, Route } from "@playwright/test";

// Данные для скриншотов: всегда одни и те же, чтобы картинки не менялись от запуска к запуску

const CATEGORIES = [
    ["c1", "Супы", "Soup", 3],
    ["c2", "Выпечка", "Bread", 3],
    ["c3", "Салаты", "Salad", 2],
    ["c4", "Горячее", "CookingPot", 2],
    ["c5", "Десерты", "CakeSlice", 0],
    ["c0", "Разное", "Cutlery", 0],
].map(([id, name, iconName, recipeCount]) => ({ id, name, iconName, recipeCount, userId: "u", isDefault: id === "c0" }));

const TAGS = ["Быстро", "Вегетарианское", "На праздник", "Завтрак", "Острое"]
    .map((name, index) => ({ id: `t${index}`, name, recipeCount: 2 }));

const TITLES = [
    ["Борщ с говядиной и пампушками", "c1"],
    ["Шакшука", "c4"],
    ["Тыквенный крем-суп", "c1"],
    ["Греческий салат", "c3"],
    ["Сырники со сметаной", "c2"],
    ["Рамен с курицей", "c1"],
    ["Пирог с яблоками", "c2"],
    ["Паста карбонара", "c4"],
    ["Салат с киноа и авокадо", "c3"],
    ["Банановый хлеб", "c2"],
];

const INGREDIENTS = [
    {
        title: null,
        items: [
            { name: "Говядина на кости", amount: 600, unit: "g" },
            { name: "Свёкла", amount: 2, unit: "pcs" },
            { name: "Капуста белокочанная", amount: 300, unit: "g" },
            { name: "Картофель", amount: 3, unit: "pcs" },
            { name: "Морковь", amount: 1, unit: "pcs" },
            { name: "Томатная паста", amount: 2, unit: "tbsp" },
            { name: "Чеснок", amount: 3, unit: "clove" },
            { name: "Соль", amount: null, unit: "to_taste" },
        ],
    },
    {
        title: "Для пампушек",
        items: [
            { name: "Мука", amount: 300, unit: "g" },
            { name: "Молоко", amount: 150, unit: "ml" },
        ],
    },
];

const STEPS = [
    "Залейте говядину холодной водой, доведите до кипения, снимите пену и варите на слабом огне 1,5 часа.",
    "Свёклу натрите на крупной тёрке и потушите с томатной пастой 10 минут.",
    "Лук и морковь обжарьте на растительном масле до мягкости.",
    "Добавьте картофель кубиками и капусту, через 10 минут зажарку и свёклу.",
].map((text) => ({ text, images: [] }));

const RECIPES = TITLES.map(([title, categoryId], index) => ({
    id: `r${index}`,
    userId: "u",
    title,
    description: index === 0 ? "Классический борщ на говяжьем бульоне, насыщенный и чуть сладковатый." : null,
    categoryId,
    category: CATEGORIES.find(({ id }) => id === categoryId),
    ingredients: INGREDIENTS,
    steps: STEPS,
    prepTime: 20,
    cookTime: index % 3 ? 40 : 120,
    servings: 4,
    calories: 320,
    protein: 18,
    fat: 14,
    carbs: 28,
    sourceUrl: "https://example.com/borsch",
    source: "other",
    telegraphUrl: null,
    media: [{ id: `m${index}`, url: `/api/img/${index}.svg`, type: "image", order: 0 }],
    tags: [{ tagId: "t0", tag: TAGS[0] }, { tagId: TAGS[1 + (index % 4)].id, tag: TAGS[1 + (index % 4)] }],
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
}));

const ME = { id: "u", plan: "FREE", recipeLimit: 50, recipeCount: RECIPES.length, aiEnabled: true, language: "ru", theme: null, animations: false };

const DRAFT = { id: "d1", title: "Том ям", origin: "ai", source: "other", createdAt: "2026-10-25T10:00:00Z", updatedAt: "2026-10-25T10:00:00Z" };

// Обложка: тарелка на цветном фоне, свой цвет у каждого рецепта
const COLORS = ["#E8A15A", "#EBD9A0", "#B9CC8E", "#DE7F6E", "#F3E3B0", "#C9BBA6", "#E2C28F", "#F0C46A", "#A8B88A", "#D7A16E"];

const cover = (index: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">
<rect width="600" height="450" fill="${COLORS[index % COLORS.length]}"/>
<circle cx="300" cy="225" r="170" fill="#F7F1E6"/><circle cx="300" cy="225" r="130" fill="#B5432F"/>
</svg>`;

const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

export const mockApi = async (page: Page) => {
    // Только запросы к серверу: исходники вроде /src/shared/api/index.ts отдаёт Vite
    await page.route((url) => url.pathname.startsWith("/api/"), (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;

        const image = path.match(/^\/api\/img\/(\d+)\.svg$/);
        if (image) return route.fulfill({ contentType: "image/svg+xml", body: cover(Number(image[1])) });

        if (path === "/api/me") return json(route, ME);
        if (path === "/api/categories") return json(route, CATEGORIES);
        if (path === "/api/tags") return json(route, TAGS);
        if (path === "/api/drafts") return json(route, [DRAFT]);
        if (path.startsWith("/api/drafts/")) return json(route, { ...DRAFT, data: {} });

        if (path === "/api/recipes") {
            const categoryId = url.searchParams.get("categoryId");
            return json(route, RECIPES.filter((recipe) => !categoryId || recipe.categoryId === categoryId));
        }

        const recipe = RECIPES.find(({ id }) => path === `/api/recipes/${id}`);
        if (recipe) return json(route, recipe);

        return json(route, { error: "Not found" }, 404);
    });
};
