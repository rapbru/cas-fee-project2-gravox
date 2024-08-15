import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("airbnb-base", "prettier"), {
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        ecmaVersion: 2020,
        sourceType: "module",
    },

    rules: {
        indent: "off",
        "no-plusplus": "off",
        "import/extensions": "on",
        "object-curly-newline": "off",
        "object-curly-spacing": "off",
        "linebreak-style": "off",
    },
}];