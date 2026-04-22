import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Server-only packages that must never land in the browser bundle.
// If these get imported from src/**, Vite will bundle them into the SPA,
// blowing up the payload and shipping Node deps to users.
const SERVER_ONLY_PACKAGES = [
  { name: '@supabase/supabase-js', message: 'Import @supabase/supabase-js only in netlify/functions/** — server side.' },
  { name: 'resend', message: 'Import resend only in netlify/functions/** — server side.' },
]

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.netlify', 'supabase']),

  // JS / JSX (frontend)
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-restricted-imports': ['error', { paths: SERVER_ONLY_PACKAGES }],
    },
  },

  // TS / TSX (frontend)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-restricted-imports': ['error', { paths: SERVER_ONLY_PACKAGES }],
    },
  },

  // Netlify Functions (Node, TS) — server-only deps are allowed here
  {
    files: ['netlify/functions/**/*.{ts,js}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
    },
  },

  // Scripts + config files (Node)
  {
    files: ['scripts/**/*.{js,ts}', '*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Entry file: React fast-refresh rule doesn't apply — it's the root bootstrap.
  {
    files: ['src/main.{js,jsx,ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
