// @ts-check

import typescript from '@rollup/plugin-typescript';

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
];
