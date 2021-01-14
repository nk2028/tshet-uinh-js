import ts from "@wessberg/rollup-plugin-ts";

export default {
  input: 'src/index.ts',
  output: [{
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    name: 'Qieyun',
  }, {
    file: 'module/index.js',
    format: 'esm',
    sourcemap: true,
  }],
  plugins: [ts()]
};
