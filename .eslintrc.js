module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  root: true,
  extends: ['coderdojo'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'trace', 'log', 'error'] }],
    'class-methods-use-this': 0,
    'consistent-return': 0,
  },
};
