import ts from 'rollup-plugin-ts';

export default {
  input: 'src/entry.ts',
  output: {
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    name: 'Qieyun',
    exports: 'named',
  },
  plugins: [ts()],
};
