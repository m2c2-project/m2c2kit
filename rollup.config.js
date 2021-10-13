import shim from 'rollup-plugin-shim';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './dist/out-tsc/m2c2kit.js',
  output: {
    file: './dist/m2c2kit.esm.js',
    format: 'esm',
    name: 'm2c2kit',
    sourcemap: true
  },
  plugins: [
    shim({
      fs: `export function fs_empty_shim() { }`,
      path: `export function path_empty_shim() { }`
    }),
    nodeResolve(),
    commonjs({
      include: 'node_modules/canvaskit-wasm/**'
    }),
  ],
};
