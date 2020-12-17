module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'max-len': 1,
    'no-nested-ternary': 0,
    'object-property-newline': 0,
    'quotes': [1, 'single'],
  },
};
