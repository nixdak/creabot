module.exports = {
  'env': {
    'es6'    : true,
    'node'   : true,
  },
  'extends': ['eslint:recommended'],
  'rules'  : {
    'strict': [
      2,
     'global'
    ],
    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'no-console': [
      "error",
      {
        allow: [
          "log",
          "warning",
          "warn",
          "error"
        ]
      }
    ],
    'semi': [
      'error',
      'always',
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'key-spacing': [
      'error',
      {
        'multiLine': {
          'beforeColon': false,
          'afterColon' : true,
        },
        'align': {
          'beforeColon': false,
          'afterColon' : true,
          'on'         : 'colon',
          'mode'       : 'strict',
        },
      },
    ],
    'no-multi-spaces': 0,
    'no-var': [
      'error',
    ],
    'prefer-const': [
      'error',
      {
        'destructuring'         : 'any',
        'ignoreReadBeforeAssign': false,
      },
    ],
  },
};
