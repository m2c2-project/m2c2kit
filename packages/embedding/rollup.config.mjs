import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import child_process from "child_process";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const shortCommitHash = child_process
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .slice(0, 8);

export default [
  {
    input: ["./src/index.ts"],
    external: ["@m2c2kit/core"],
    output: [
      { file: "./build/index.js", format: "es", sourcemap: true },
      {
        file: "./build/index.min.js",
        format: "es",
        plugins: [minify()],
      },
    ],
    plugins: [
      replace({
        __PACKAGE_JSON_VERSION__: `${pkg.version} (${shortCommitHash})`,
        preventAssignment: true,
      }),
      nodeResolve(),
      esbuild(),
    ],
  },
  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        // hook must be 'closeBundle' because we need dist/index.d.ts to
        // be created before we can copy it
        hook: "closeBundle",
        targets: [
          {
            src: "build/index.js*",
            dest: "dist",
          },
          {
            src: "build/index.js",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.embedding.esm.js",
            transform: (contents) =>
              contents
                .toString()
                .replace("//# sourceMappingURL=index.js.map\n", ""),
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.embedding.esm.d.ts",
          },
          {
            src: "build/index.min.js",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.embedding.esm.min.js",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.embedding.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
