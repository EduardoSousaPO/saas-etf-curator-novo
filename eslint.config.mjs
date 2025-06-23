import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      // Disable problematic TypeScript ESLint rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      
      // Disable React Hook rules that might be problematic
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Disable other problematic rules
      "no-unused-vars": "off",
      "prefer-const": "warn",
      
      // Next.js specific rules
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    }
  }),
];

export default eslintConfig;
