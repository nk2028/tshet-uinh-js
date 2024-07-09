// @ts-check

import typescript from '@rollup/plugin-typescript';

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
  plugins: [
    typescript({
      // XXX Apparently needed with `"incremental": true` in tsconfig
      outputToFilesystem: false,
    }),
  ],
};
