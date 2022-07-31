import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: ["./src/index.ts"],
    output: [{ dir: "./dist", format: "es", sourcemap: true }],
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    plugins: [typescript({ outputToFilesystem: true })],
  },
];
