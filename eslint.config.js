// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.cjs'],
    languageOptions: { globals: { Buffer: 'readonly', __dirname: 'readonly' } },
  },
  {
    // Existing screens use effect-driven HTTP loading. Keep these baseline
    // findings visible without changing unrelated academic screens in HU27/28.
    files: ['src/screens/AsistenciaScreen.tsx', 'src/screens/BoletinesScreen.tsx', 'src/screens/NotasScreen.tsx'],
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
]);
