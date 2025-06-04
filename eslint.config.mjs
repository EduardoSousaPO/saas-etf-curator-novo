import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Permite any em casos específicos onde é necessário (APIs externas, etc)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Permite variáveis não utilizadas que começam com underscore
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      // Permite caracteres não escapados em JSX (aspas)
      'react/no-unescaped-entities': 'warn',
      // Permite objetos vazios em interfaces
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Permite prefer-const menos rigoroso
      'prefer-const': 'warn'
    }
  }
];

export default eslintConfig;
