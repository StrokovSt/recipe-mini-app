import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/prisma/**", "figma/**"],
    },
    {
        files: ["backend/src/**/*.ts", "frontend/src/**/*.{ts,tsx}", "bot/src/**/*.ts"],
        languageOptions: {
            parser,
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
                        // Side-effects и dotenv — всегда первыми
                        ["^dotenv", "^\\u0000"],
                        // Внешние библиотеки
                        ["^node:", "^(?!@recipe)@?\\w"],
                        // Внутренние пакеты монорепо
                        ["^@recipe/"],
                        // Абсолютные @/ и /
                        ["^@/", "^/"],
                        // Относительные
                        ["^\\.(?!.*\\.css$)"],
                        // Стили
                        ["\\.css$", "\\.scss$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "import/newline-after-import": "error",
        },
    },
    {
        files: ["backend/src/**/*.ts", "bot/src/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ["frontend/src/**/*.{ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        },
    },
];
