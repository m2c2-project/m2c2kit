import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { InputOptions, Plugin } from "rollup";

export function makeM2c2kitServiceWorker(
  rootDir: string,
  additionalFiles?: Array<string>,
): Plugin {
  let inputFile = "";

  return {
    name: "make-m2c2kit-serviceworker",
    buildStart: {
      handler(options: InputOptions) {
        if (options.input) {
          if (typeof options.input === "string") {
            inputFile = path.resolve(options.input);
          } else if (Array.isArray(options.input)) {
            inputFile = path.resolve(options.input[0]);
          } else {
            throw new Error(
              "Could not determine input file when trying to add service worker code.",
            );
          }
        }
      },
    },
    transform: {
      handler(code: string, id: string): string {
        if (id === inputFile) {
          if (code.includes("//# sourceMappingURL")) {
            code = code.replace(
              "//# sourceMappingURL",
              serviceWorkerRegistrationCode + "\n//# sourceMappingURL",
            );
          }
        }
        return code;
      },
    },
    closeBundle: {
      sequential: true,
      async handler() {
        // this is the path of our @m2c2kit/build-helpers package
        // our sw.js template is stored under the "assets" folder here
        const packageHomeFolderPath = path.dirname(
          fileURLToPath(import.meta.url),
        );

        let swContents = (
          await readFile(path.join(packageHomeFolderPath, "assets", "sw.js"))
        ).toString();

        const manifestFilename = path.join(rootDir, "hash-manifest.json");
        const manifestContents = (await readFile(manifestFilename)).toString();
        const manifest = JSON.parse(manifestContents);
        const hashedFilenames = Object.values(manifest);
        let replacementString = hashedFilenames.map((f) => `"${f}"`).join(",");
        if (additionalFiles) {
          replacementString =
            replacementString +
            "," +
            additionalFiles.map((f) => `"${f}"`).join(",");
        }

        swContents = swContents.replace(
          '"_-_ADDITIONAL_RESOURCES_TO_CACHE_-_"',
          replacementString,
        );

        const swDestinationFilename = path.join(rootDir, "sw.js");
        await writeFile(swDestinationFilename, swContents);
      },
    },
  };
}

const serviceWorkerRegistrationCode = `const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error("Registration failed with " + error);
    }
  }
};

registerServiceWorker();`;
