import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import { addModuleMetadata, insertVersionString } from "@m2c2kit/build-helpers";

export default () => {
  const finalConfig = [
    {
      input: "./src/index.ts",
      external: ["@m2c2kit/core", "@m2c2kit/addons"],
      output: [
        {
          file: "./dist/index.js",
          format: "es",
        },
        {
          file: "./dist/index.min.js",
          format: "es",
          plugins: [minify()],
        },
      ],
      plugins: [
        insertVersionString(),
        addModuleMetadata(),
        nodeResolve(),
        esbuild(),
      ],
    },
  ];
  return finalConfig;
};
