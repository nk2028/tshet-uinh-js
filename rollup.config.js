import babel from '@rollup/plugin-babel';

export default {
  input: 'src/入口.js',
  output: [{
    file: 'bundle-cjs.js',
    format: 'cjs',
  }, {
    file: 'bundle-umd.js',
    format: 'umd',
    name: 'Qieyun',
  }],
  plugins: [babel({ babelHelpers: 'bundled' })],
};
