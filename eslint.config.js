// @ts-check

import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/**/*'] },
  {
    files: ['src/**/*.?(c|m)js', '*.?(c|m)js', 'src/**/*.ts'],
    extends: [
      js.configs.recommended,
      // @ts-ignore -- type is valid
      comments.recommended,
      importPlugin.flatConfigs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      '@eslint-community/eslint-comments/no-unused-disable': 'error',

      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'parent', 'sibling', 'index', 'type'],
          'sortTypesGroup': true,
          'newlines-between': 'always',
          'newlines-between-types': 'always',
          'named': true,
          'alphabetize': { order: 'asc', orderImportKind: 'asc', caseInsensitive: true },
          'warnOnUnassignedImports': true,
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    extends: [
      importPlugin.flatConfigs.typescript,
      // ...tseslint.configs.recommended,
      // ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        // projectService: true,
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          // use `recommended` defaults instead of `strict` defaults
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          // reportUsedIgnorePattern: true,
        },
      ],
      // NOTE Currently there is no way to allow just strings AND string literals,
      // so unfortunately this rule has to be turned off entirely.
      '@typescript-eslint/no-misused-spread': 'off',
    },
  },
);
