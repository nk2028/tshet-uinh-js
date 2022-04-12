import ts from "rollup-plugin-ts";

export default {
  input: 'src/index.ts',
  output: {
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    name: 'Qieyun',
  },
  plugins: [ts()]
};
