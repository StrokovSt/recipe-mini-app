import { type Ingredient, UNIT_CODES, type UnitCode } from "@recipe/common";

// Как единицы пишут в рецептах, кроме подписей из словаря: сокращения и формы слова.
// Пробел — между частями может быть точка и пробел («ст. л.», «ст.л.», «стл»).
// «*» в конце — дальше окончание: «стакан*» подходит к «стакана» и «стаканов»
const UNIT_ALIASES: Record<UnitCode, string[]> = {
    g: ["г", "гр", "грамм*", "g", "gr", "gram*"],
    kg: ["кг", "килограмм*", "kg", "kilo*"],
    oz: ["унц*", "oz", "ounce*"],
    lb: ["фунт*", "lb", "lbs", "pound*"],
    ml: ["мл", "миллилитр*", "ml", "milliliter*", "millilitre*"],
    l: ["л", "литр*", "l", "liter*", "litre*"],
    tsp: ["ч л", "чайн* лож*", "tsp", "teaspoon*"],
    tbsp: ["ст л", "столов* лож*", "tbsp", "tablespoon*"],
    glass: ["стакан*", "glass*"],
    cup_us: ["чашк*", "чашек", "cup*"],
    pcs: ["шт", "штук*", "pc", "pcs", "piece*"],
    clove: ["зубч*", "зубок", "clove*"],
    slice: ["ломт*", "slice*"],
    bunch: ["пуч*", "bunch*"],
    sprig: ["веточ*", "веток", "sprig*"],
    can: ["банк*", "банок", "can", "cans"],
    pack: ["упаков*", "пачк*", "пачек", "pack*", "package*"],
    pinch: ["щепот*", "pinch*"],
    handful: ["горст*", "handful*"],
    to_taste: ["по вкусу", "to taste"],
};

const FRACTIONS: Record<string, number> = { "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4, "⅛": 1 / 8 };
const FRACTION_CHARS = Object.keys(FRACTIONS).join("");

// Число: «1 1/2», «1/2», «2,5», «1½», «½». Длинные записи раньше, иначе от «1/2» взялась бы только «1».
// Диапазон «2-3» даёт нижнюю границу
const NUMBER = `(?:\\d+\\s+\\d+/\\d+|\\d+/\\d+|\\d+(?:[.,]\\d+)?(?:\\s*[${FRACTION_CHARS}])?|[${FRACTION_CHARS}])`;
const AMOUNT = `(${NUMBER})(?:\\s*[-–—]\\s*${NUMBER})?`;

const LEADING_AMOUNT = new RegExp(`^${AMOUNT}\\s*`, "u");
// Последнее число в строке и всё, что после него
const TRAILING_AMOUNT = new RegExp(`${AMOUNT}([^\\d${FRACTION_CHARS}]*)$`, "u");
// Маркер списка или номер пункта в начале строки: «-», «•», «1.», «2)»
const LIST_MARKER = /^(?:[-–—•*·▪●○◦‣⁃]+\s*|\d+[.)]\s+)/u;
// Разделители между названием и количеством: «Мука — 200 г», «Мука: 200 г», «Мука (200 г)»
const SEPARATORS = /[\s,:;—–\-(]+$/u;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Подпись или сокращение в регулярное выражение: части через необязательные точку и пробел,
// после единицы не может идти буква («л» не подходит к «лук»)
const toPattern = (alias: string) => {
    const parts = alias.toLowerCase().replace(/\./g, " ").trim().split(/\s+/);
    const body = parts
        .map((part) => (part.endsWith("*") ? `${escape(part.slice(0, -1))}\\p{L}*` : escape(part)))
        .join("\\.?\\s*");
    return `${body}\\.?`;
};

export type UnitLabels = Record<UnitCode, string>;

// Единица в начале текста. Длинные варианты раньше коротких: «стакан» проверяется до «ст. л.»
const buildUnitMatchers = (labels: UnitLabels) =>
    UNIT_CODES.flatMap((unit) => [labels[unit], ...UNIT_ALIASES[unit]].map((alias) => ({ unit, alias })))
        .sort((a, b) => b.alias.length - a.alias.length)
        .map(({ unit, alias }) => ({ unit, regex: new RegExp(`^(?:${toPattern(alias)})(?![\\p{L}\\d])`, "iu") }));

type UnitMatcher = ReturnType<typeof buildUnitMatchers>[number];

// «по вкусу» в конце строки после названия: «Соль по вкусу», «Перец — по вкусу»
const buildToTasteMatchers = (labels: UnitLabels) =>
    [labels.to_taste, ...UNIT_ALIASES.to_taste].map(
        (alias) => new RegExp(`(?:^|[\\s,:;—–\\-(])(?:${toPattern(alias)})\\)?$`, "iu")
    );

const parseNumber = (text: string): number => {
    const [whole, fraction] = text.trim().split(/\s+/);
    if (fraction) return parseNumber(whole) + parseNumber(fraction);

    const last = whole.slice(-1);
    if (last in FRACTIONS) {
        return (whole.length > 1 ? Number(whole.slice(0, -1).trim()) : 0) + FRACTIONS[last];
    }
    if (whole.includes("/")) {
        const [numerator, denominator] = whole.split("/").map(Number);
        return numerator / denominator;
    }
    return Number(whole.replace(",", "."));
};

// Количество до сотых, ноль и непонятное — без количества
const toAmount = (text: string) => {
    const amount = Math.round(parseNumber(text) * 100) / 100;
    return Number.isFinite(amount) && amount > 0 ? amount : null;
};

// Единица в начале текста: код и сколько символов она заняла
const matchUnit = (text: string, matchers: UnitMatcher[]) => {
    for (const { unit, regex } of matchers) {
        const match = regex.exec(text);
        if (match) return { unit, length: match[0].length };
    }
    return null;
};

const cleanName = (text: string) => text.replace(SEPARATORS, "").replace(/^[\s,:;—–\-)]+/u, "").trim();

const parseLine = (line: string, matchers: UnitMatcher[], toTaste: RegExp[]): Ingredient | null => {
    const text = line.trim().replace(LIST_MARKER, "").trim();
    // Пустая строка или заголовок вроде «Для соуса:»
    if (!text || text.endsWith(":")) return null;

    // «200 г муки», «2 ст. л. сахара», «3 яйца», «2 cups of flour»
    const leading = LEADING_AMOUNT.exec(text);
    if (leading) {
        const rest = text.slice(leading[0].length);
        const unit = matchUnit(rest, matchers);
        const name = cleanName((unit ? rest.slice(unit.length) : rest).trim().replace(/^of\s+/i, ""));
        return name ? { name, amount: toAmount(leading[1]), unit: unit?.unit ?? null } : null;
    }

    // «Мука — 200 г», «Яйца 3 шт.», «Соль по вкусу», «Мука» без количества
    const trailing = TRAILING_AMOUNT.exec(text);
    if (trailing) {
        const tail = trailing[2].replace(/[\s.)]+$/u, "").trim();
        const unit = tail ? matchUnit(tail, matchers) : null;
        // После числа только единица (или ничего): иначе число часть названия, например «Сливки 33%»
        if (!tail || unit?.length === tail.length) {
            const name = cleanName(text.slice(0, trailing.index));
            if (name) return { name, amount: toAmount(trailing[1]), unit: unit?.unit ?? null };
        }
    }

    for (const regex of toTaste) {
        const match = regex.exec(text);
        const name = match ? cleanName(text.slice(0, match.index)) : "";
        if (name) return { name, amount: null, unit: "to_taste" };
    }

    return { name: cleanName(text), amount: null, unit: null };
};

// Разбирает список ингредиентов, вставленный текстом: каждая строка — ингредиент.
// labels — подписи единиц на языке приложения, их тоже узнаём
export const parseIngredientList = (text: string, labels: UnitLabels): Ingredient[] => {
    const matchers = buildUnitMatchers(labels);
    const toTaste = buildToTasteMatchers(labels);

    return text
        .split(/\r?\n/)
        .map((line) => parseLine(line, matchers, toTaste))
        .filter((item): item is Ingredient => item !== null && item.name !== "");
};
