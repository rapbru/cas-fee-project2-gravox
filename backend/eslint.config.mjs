import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import babelParser from "@babel/eslint-parser";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
    baseDirectory: dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("airbnb-base", "prettier"), {
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },
        parser: babelParser,
        parserOptions: {
            requireConfigFile: false,
            babelOptions: {
              babelrc: false,
              configFile: false,
              presets: ["@babel/preset-env"]
            }
        },
        ecmaVersion: 2020,
        sourceType: "module",
    },
    rules: {
        indent: "off",
        "no-plusplus": "off",
        "import/extensions": "off",
        "object-curly-newline": "off",
        "object-curly-spacing": "off",
        "linebreak-style": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
        "import/no-extraneous-dependencies": "off",
    },
}];