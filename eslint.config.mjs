import { includeIgnoreFile } from "@eslint/compat";
import eslintJS from "@eslint/js";
import eslintPluginStylisticTS from "@stylistic/eslint-plugin-ts";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPerfectionist from "eslint-plugin-perfectionist";
import globals from "globals";
import path from "node:path";
import eslintTS from "typescript-eslint";

const eslintConfig = [
  includeIgnoreFile(path.join(import.meta.dirname, ".gitignore")),
  {
    ignores: ["*.config.mjs"],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintJS.configs.all,
  {
    rules: {
      "func-style": [
        "error",
        "declaration",
        {
          allowArrowFunctions: true,
        },
      ],
      "new-cap": "off",
      "no-duplicate-imports": "off",
      "id-length": "off",
      "sort-imports": "off",
      "max-statements": "off",
      "no-await-in-loop": "off",
      "one-var": "off",
      "no-undefined": "off",
      "no-underscore-dangle": "off",
      "no-ternary": "off",
    },
  },
  ...eslintTS.configs.all,
  {
    languageOptions: {
      parser: eslintTS.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          format: ["camelCase"],
          selector: [
            "variable",
            "parameter",
            "parameterProperty",
            "classProperty",
            "classMethod",
            "classicAccessor",
            "autoAccessor",
            "function",
          ],
        },
        {
          format: null,
          modifiers: ["unused"],
          selector: "parameter",
        },
        {
          custom: {
            match: true,
            regex: "^(are|is|has|should|can|does|did|was|will|would)[A-Z]",
          },
          format: ["camelCase"],
          selector: "variable",
          types: ["boolean"],
        },
        {
          format: ["camelCase", "PascalCase"],
          modifiers: ["const"],
          selector: "variable",
        },
        {
          format: ["camelCase"],
          leadingUnderscore: "require",
          modifiers: ["private"],
          selector: [
            "classProperty",
            "classMethod",
            "classicAccessor",
            "autoAccessor",
          ],
        },
        {
          format: ["camelCase", "PascalCase"],
          modifiers: ["default"],
          selector: "import",
        },
        {
          format: ["PascalCase"],
          selector: ["enum", "class", "interface", "typeAlias"],
        },
        {
          format: ["UPPER_CASE"],
          selector: "enumMember",
        },
      ],
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/class-methods-use-this": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/parameter-properties": "off",
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/member-ordering": "off",
    },
  },
  {
    plugins: {
      "@stylistic/ts": eslintPluginStylisticTS,
    },
    rules: {
      "@stylistic/ts/padding-line-between-statements": [
        "warn",
        {
          blankLine: "always",
          next: "*",
          prev: "*",
        },
        {
          blankLine: "any",
          next: "import",
          prev: "import",
        },
      ],
    },
  },
  eslintPluginImport.flatConfigs.recommended,
  {
    rules: {
      "import/no-unresolved": "off",
    },
  },
  eslintPluginPerfectionist.configs["recommended-natural"],
  eslintConfigPrettier,
  {
    rules: {
      curly: "warn",
    },
  },
];

export default eslintConfig;
