module.exports = [
  {
    ignores: ['node_modules/**', '.next/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
        Promise: 'readonly'
      }
    }
  }
];