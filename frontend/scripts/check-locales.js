// Проверяет, что в словарях всех языков тот же набор ключей, что в русских (эталон).
// Плюральные формы (_one, _few, _many, _other) сравниваются по ключу без суффикса:
// у каждого языка свой набор форм. Запуск: npm run i18n:check -w frontend
import { readdirSync, readFileSync } from "node:fs";

const LOCALES = new URL("../src/shared/config/i18n/locales/", import.meta.url);
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const collectKeys = (dictionary, prefix = "") =>
    Object.entries(dictionary).flatMap(([key, value]) =>
        typeof value === "object" ? collectKeys(value, `${prefix}${key}.`) : [`${prefix}${key.replace(PLURAL_SUFFIX, "")}`],
    );

const readKeys = (language, file) => new Set(collectKeys(JSON.parse(readFileSync(new URL(`${language}/${file}`, LOCALES), "utf8"))));

const languages = readdirSync(LOCALES);
const files = readdirSync(new URL("ru/", LOCALES));
const problems = [];

for (const file of files) {
    const reference = readKeys("ru", file);

    for (const language of languages) {
        let keys;
        try {
            keys = readKeys(language, file);
        } catch {
            problems.push(`${language}/${file}: нет файла или он не читается`);
            continue;
        }

        const missing = [...reference].filter((key) => !keys.has(key));
        const extra = [...keys].filter((key) => !reference.has(key));
        if (missing.length) problems.push(`${language}/${file}: не хватает ${missing.join(", ")}`);
        if (extra.length) problems.push(`${language}/${file}: лишние ${extra.join(", ")}`);
    }
}

if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
}

console.log(`Словари совпадают (языков: ${languages.length}, словарей: ${files.length})`);
