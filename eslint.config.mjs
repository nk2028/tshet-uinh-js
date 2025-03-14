// @ts-check

import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
// @ts-ignore -- import is valid
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['index.js'] },
  {
    files: ['src/**/*.?(c|m)js', '*.?(c|m)js', 'src/**/*.ts'],
    extends: [
      js.configs.recommended,
      // @ts-ignore -- type is valid
      comments.recommended,
    ],
    rules: {
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
    },
  },
  // TODO Make eslint-plugin-import work with JS files (like this one)
  {
    files: ['src/**/*.ts'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      // ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      // ...tseslint.configs.strictTypeChecked,
      // ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        // projectService: {
        //   defaultProject: './tsconfig.test.json',
        // },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: true,
        node: true,
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

      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          'alphabetize': { order: 'asc' },
        },
      ],
    },
  },
);
