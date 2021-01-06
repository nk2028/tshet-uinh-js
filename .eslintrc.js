module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'max-len': 0,
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-multi-str': 0,
    'no-nested-ternary': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-use-before-define': 0,
    'object-curly-newline': 0,
    'object-property-newline': 0,
    'quotes': [1, 'single'],
  },
};
