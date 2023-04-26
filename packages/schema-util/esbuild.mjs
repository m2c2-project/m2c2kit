import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: false,
  outfile: "build/index.js",
  target: "node18",
  sourcemap: true,
});
