import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/dist', '**/.jest-cache', '**/coverage'],
  },
  ...compat.extends(
    'eslint:recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ),
  {
    plugins: {
      'jsx-a11y': jsxA11Y,
      react,
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: true,
        Cypress: true,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          legacyDecorators: true,
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: '18',
      },

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: true,
        node: true,
      },
    },

    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allow: [
            '_id',
            '__REDUX_DEVTOOLS_EXTENSION__',
            '__filename',
            '__dirname',
          ],
        },
      ],

      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['to', 'hrefLeft', 'hrefRight'],
          aspects: ['noHref', 'invalidHref', 'preferButton'],
        },
      ],

      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.js', '.jsx', '.tsx', '.ts'],
        },
      ],

      'no-console': [
        'error',
        {
          allow: ['error', 'debug'],
        },
      ],

      'no-restricted-syntax': 'off',

      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',
      'import/no-named-as-default': 'off',
      'import/export': 'off',

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
