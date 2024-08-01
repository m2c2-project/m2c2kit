import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { copyAssets } from "@m2c2kit/build-helpers";

export default (commandLineArgs) => {
  const port = commandLineArgs.configPort || 3000;

  const finalConfig = [
    {
      input: "./src/runner.ts",
      output: [
        {
          file: `./build/index.js`,
          format: "es",
          sourcemap: true,
        },
      ],
      plugins: [
        nodeResolve(),
        esbuild({
          tsconfig: "tsconfig.runner.json",
        }),
        copyAssets({ id: "color-shapes", outputFolder: "./build" }),
        serve({
          /**
           * Start development server and automatically open browser with
           *   npm run serve -- --configOpen
           * However, to debug and hit breakpoints, you must launch
           * the browser through vs code.
           */
          open: commandLineArgs.configOpen && true,
          verbose: true,
          contentBase: ["./build"],
          historyApiFallback: true,
          host: "localhost",
          port: port,
        }),
        /**
         * Try a shorter delay for quicker reloads, but increase it if
         * the browser reloads before the new build is fully ready.
         */
        livereload({ watch: "build", delay: 250 }),
      ],
    },
  ];
  return finalConfig;
};
