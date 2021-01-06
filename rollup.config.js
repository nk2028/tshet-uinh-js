import babel from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'umd',
    name: 'Qieyun',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
};
