import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'build', 'coverage', 'node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'array-bracket-spacing': 'off',
      'object-curly-spacing': 'off',
      'comma-dangle': 'off',
      semi: 'off',
      quotes: 'off',
    },
  },
];
