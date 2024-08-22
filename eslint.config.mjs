// @ts-check

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import * as importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    files: ['src/**/*.?(c|m)js', '*.?(c|m)js', 'src/**/*.ts'],
    ignores: ['index.js'],
    extends: [
      eslint.configs.recommended,
      ...compat.extends('plugin:eslint-comments/recommended'),
      ...compat.extends('plugin:import/typescript'),
    ],
    plugins: {
      'eslint-comments': eslintCommentsPlugin,
      'import': importPlugin,
    },
    rules: {
      'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      'eslint-comments/no-unused-disable': 'error',

      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          'alphabetize': { order: 'asc' },
        },
      ],

      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    extends: [
      //...tseslint.configs.recommended,
      //...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],

      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
        },
      ],
    },
  },
  prettierConfig,
);
