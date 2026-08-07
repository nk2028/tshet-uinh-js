// @ts-check

import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';

/** @type { import("rollup").RollupOptions[] } */
export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'index.js',
      format: 'umd',
      sourcemap: true,
      name: 'TshetUinh',
      exports: 'named',
    },
    plugins: [
      typescript({
        // NOTE Apparently needed with `"incremental": true` in tsconfig
        outputToFilesystem: false,
      }),
      /** @type { import("rollup").Plugin } */ (string({ include: '**/*.txt' })),
    ],
  },
];
