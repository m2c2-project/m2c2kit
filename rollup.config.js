import shim from 'rollup-plugin-shim';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve'
import copy from 'rollup-plugin-copy'

export default {
  input: './dist/out-tsc/m2c2kit.js',
  output: {
    file: './dist/m2c2kit.esm.js',
    format: 'esm',
    name: 'm2c2kit',
    sourcemap: "inline"
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
    copy({
      targets: [
        { src: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', dest: 'dist' },
      ]
    }), 
    serve({
      open: false,
      verbose: true,
      contentBase: ['example', 'dist'],
      historyApiFallback: true,
      host: 'localhost',
      port: 3000,
    })
  ],
};
