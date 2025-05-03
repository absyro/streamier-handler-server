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
    ignores: ["*.config.{cj,mj,j}s"],
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
      "id-length": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "new-cap": "off",
      "no-await-in-loop": "off",
      "no-duplicate-imports": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-underscore-dangle": "off",
      "no-void": "off",
      "one-var": ["error", "never"],
      "require-atomic-updates": "off",
      "sort-imports": "off",
      "sort-vars": "off",
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
      "@typescript-eslint/class-methods-use-this": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/member-ordering": "off",
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
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/parameter-properties": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
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
