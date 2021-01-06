import babel from '@rollup/plugin-babel';

export default {
  input: 'src/入口.js',
  output: {
    file: 'bundle.js',
    format: 'umd',
    name: 'Qieyun',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
};
