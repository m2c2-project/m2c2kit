import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import {
  addModuleMetadata,
  insertVersionString,
  writeMetadataJson,
} from "@m2c2kit/build-helpers";

writeMetadataJson();

export default () => {
  const outputFolder = "dist";

  const finalConfig = [
    {
      input: "./src/index.ts",
      external: ["@m2c2kit/core", "@m2c2kit/addons"],
      output: [
        {
          dir: outputFolder,
          format: "es",
          sourcemap: false,
        },
      ],
      plugins: [
        insertVersionString(),
        addModuleMetadata(),
        nodeResolve(),
        esbuild(),
      ],
      onwarn: (warning) => {
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
          /**
           * Suppress this warning. Constants.MODULE_METADATA_PLACEHOLDER
           * is replaced during the build process, so it's not actually
           * used in the final code.
           */
          if (
            warning.message.includes("Constants") &&
            warning.message.includes("@m2c2kit/core")
          ) {
            return;
          }
        }
        // Log other warnings to console
        console.warn(warning.message);
      },
    },
  ];
  return finalConfig;
};
