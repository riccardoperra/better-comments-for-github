import {tanstackConfig} from "@tanstack/config/eslint";
import unusedImports from "eslint-plugin-unused-imports";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tanstackConfig,
  {
    name: "tanstack/temp",
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-case-declarations": "off",
      "no-shadow": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "unused-imports/no-unused-imports": "warn",
    },
  },
];
