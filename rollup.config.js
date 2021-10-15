import typescript from '@rollup/plugin-typescript';
import shim from 'rollup-plugin-shim';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy'

export default {
  input: './src/m2c2kit.ts',
  output: [
    { dir: './dist', format: 'esm', name: 'm2c2kit', sourcemap: true },
  ],
  plugins: [
    typescript({ tsconfig: './src/tsconfig.json' }),
    // canvaskit-wasm references these node.js functions
    // shim them to empty functions for browser usage
    shim({
      fs: `export function fs_empty_shim() { }`,
      path: `export function path_empty_shim() { }`
    }),
    nodeResolve(),
    commonjs({
      include: 'node_modules/canvaskit-wasm/**'
    }),
    copy({
      targets: [
        // copy the wasm bundle out of node_modules so it can be served
        { src: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', dest: 'dist' },
      ],
      hook: 'writeBundle'
    })
  ],
};
