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
    typescript({inlineSourceMap: true, inlineSources: true}),
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
        // copy declaration files to examples folders so we get VS Code intellisense
        { src: 'dist/m2c2kit.d.ts', dest: 'examples/javascript' },
        { src: 'dist/webColors.d.ts', dest: 'examples/javascript' }        
      ],
      // hook must be set to writeBundle, because declaration files don't exist until this stage
      hook: 'writeBundle'
    })
  ],
};
