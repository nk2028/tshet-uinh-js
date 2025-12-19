// @ts-check

import typescript from '@rollup/plugin-typescript';

/** @type { import('rollup').RollupOptions[] } */
export default [
  {
    input: 'src/index.ts',
    output: [
      // NOTE Specify `dir` and `entryFileNames` instead of `file` to workaround TypeScript plugin's complaint
      // about the difference between the parent directory of `file` and the `outDir` option in TSConfig
      {
        dir: '.',
        entryFileNames: 'dist/tshet-uinh.js',
        format: 'es',
        exports: 'named',
        sourcemap: true,
      },
      {
        dir: '.',
        entryFileNames: 'dist/tshet-uinh.cjs',
        format: 'umd',
        name: 'TshetUinh',
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
