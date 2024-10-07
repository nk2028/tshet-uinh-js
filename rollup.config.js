// @ts-check

import typescript from '@rollup/plugin-typescript';

/** @type { import("rollup").RollupOptions[] } */
export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.js',
        format: 'umd',
        name: 'TshetUinh',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: './dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: './dist/index.mjs',
        format: 'es',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        // NOTE Apparently needed with `"incremental": true` in tsconfig
        outputToFilesystem: false,
      }),
    ],
  },
];
