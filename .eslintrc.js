module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  parser: 'babel-eslint',
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'arrow-parens': ['error', 'as-needed'],
    'no-param-reassign': ['error', { props: false }],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'no-use-before-define': ['error', { functions: false }],
    'consistent-return': 0,
  },
};
