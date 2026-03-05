import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/prisma/**"],
    },
    {
        files: ["backend/src/**/*.ts", "frontend/src/**/*.{ts,tsx}", "bot/src/**/*.ts"],
        languageOptions: {
        parser,
        globals: {
            ...globals.node,
        },
        ecmaVersion: 2022,
        sourceType: "module",
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "simple-import-sort": simpleImportSort,
            "import": importPlugin,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
                },
            ],
            "simple-import-sort/imports": [
                "error",
                {
                "groups": [
                    // Библиотеки
                    ["^node:", "^@?\\w"],
                    // Абсолютные @/ и /
                    ["^@/", "^/"],
                    // Относительные импорты
                    ["^\\.(?!.*\\.css$)"],
                    // Стили — всегда последними
                    ["\\.css$", "\\.scss$"],
                ],
                },
            ],
            "simple-import-sort/exports": "error",
            "import/newline-after-import": "error",
        },
    },
];