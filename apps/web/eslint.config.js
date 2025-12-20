import eslintConfigPrettier from 'eslint-config-prettier'
import vuetify from 'eslint-config-vuetify'

export default vuetify(
  // Disable formatting rules (Prettier handles formatting)
  eslintConfigPrettier,

  // Project-specific overrides
  {
    rules: {
      // Disable rules that Oxlint handles (faster)
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      eqeqeq: 'off',
      'no-var': 'off',
      'prefer-const': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.d.ts',
      'src/auto-imports.d.ts',
      'src/components.d.ts',
      'src/typed-router.d.ts',
    ],
  },
)
