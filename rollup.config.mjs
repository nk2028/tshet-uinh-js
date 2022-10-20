import ts from 'rollup-plugin-ts';

export default {
  // FIXME src/entry.js adds default export, but also confuses index.d.ts.
  // Reverting temporarily to src/index.js
  input: 'src/index.ts',
  output: {
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    name: 'Qieyun',
    exports: 'named',
  },
  plugins: [ts()],
};
