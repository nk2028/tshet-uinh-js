// @ts-check

import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/tshet-uinh.js',
        format: 'umd',
        name: 'TshetUinh',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/tshet-uinh.esm.js',
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
