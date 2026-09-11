import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default ts.config(
  { ignores: ['**/dist/', '**/.astro/', '_site/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      // Astro's ambient JSX namespace, used for native element attribute types.
      globals: { astroHTML: 'readonly' },
    },
    rules: {
      // Astro components take props via a Props interface that ESLint reads as
      // unused; the compiler enforces it instead.
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^Props$' }],
    },
  },
  {
    // Build config and CI scripts run in Node, not the browser.
    files: ['**/*.config.{js,mjs,ts}', 'scripts/**'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
);
