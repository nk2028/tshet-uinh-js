// @ts-check

import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
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
        // NOTE Apparently needed with `"incremental": true` in tsconfig
        outputToFilesystem: false,
      }),
    ],
  },
  {
    input: 'build/esnext/index.d.ts',
    output: {
      file: 'index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
