import next from "@next/eslint-plugin-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import jsx from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["node_modules/", "dist/", ".next/", "out/"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": jsx,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": ["error"],
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
