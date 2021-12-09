#!/usr/bin/env node

// https://github.com/yargs/yargs/issues/1854#issuecomment-792354121

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import handlebars from "handlebars";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import ora from "ora";
import chalk from "chalk";

const packageHomeFolderPath = dirname(fileURLToPath(import.meta.url));

// we store the CLI version in .env
// I couldn't get dotenv working with CLI, so just read it in
let cliVersion: string;
try {
  cliVersion = fs
    .readFileSync(path.join(packageHomeFolderPath, ".env"))
    .toString()
    .split("=")[1];
} catch {
  cliVersion = "UNKNOWN";
}

const yarg = yargs(hideBin(process.argv));

function copyFile(copyFileInfo: copyFileInfo): number {
  const sourceContents = fs.readFileSync(copyFileInfo.sourceFilePath);
  fs.writeFileSync(copyFileInfo.destinationFilePath, sourceContents);
  return sourceContents.length;
}

interface copyFileInfo {
  sourceFilePath: string;
  destinationFilePath: string;
}

function applyValuesToTemplate(templateFilePath: string, contents: any) {
  const templateContents = fs.readFileSync(templateFilePath).toString();
  const template = handlebars.compile(templateContents);
  return template(contents);
}

interface templatingInfo {
  templateFilePath: string;
  destinationFilePath: string;
}

yarg
  .scriptName("m2")
  .command(
    "new <name>",
    "create a new m2c2kit app",
    (yarg) => {
      yarg.positional("name", {
        describe: "name of new app",
        type: "string",
      });
    },
    (argv) => {
      const appName = argv["name"] as string;
      const newFolderPath = path.join(path.resolve(), appName);

      if (fs.existsSync(newFolderPath)) {
        console.log(
          `${chalk.red(
            "ERROR"
          )}: folder ${newFolderPath} already exists. Please remove this folder and try again.`
        );
        yarg.exit(1, new Error("folder exists"));
      }

      fs.mkdirSync(newFolderPath);
      fs.mkdirSync(path.join(newFolderPath, "src"));
      fs.mkdirSync(path.join(newFolderPath, ".vscode"));
      fs.mkdirSync(path.join(newFolderPath, "fonts", "roboto"), {
        recursive: true,
      });

      const templateFolderPath = path.join(packageHomeFolderPath, "templates");

      const templates: templatingInfo[] = [
        {
          templateFilePath: path.join(
            templateFolderPath,
            "package.json.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "package.json"),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "rollup.config.js.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "rollup.config.js"),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "tsconfig.json.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "tsconfig.json"),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "README.md.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "README.md"),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "starter.ts.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "src", `${appName}.ts`),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "index.html.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "src", "index.html"),
        },
        {
          templateFilePath: path.join(
            templateFolderPath,
            "launch.json.handlebars"
          ),
          destinationFilePath: path.join(
            newFolderPath,
            ".vscode",
            "launch.json"
          ),
        },
      ];

      let errorProcessingTemplates = false;

      templates.forEach((t) => {
        try {
          const contents = applyValuesToTemplate(t.templateFilePath, {
            appName: appName,
            cliVersion: cliVersion,
          });
          fs.writeFileSync(t.destinationFilePath, contents);
          console.log(
            `${chalk.green("CREATE")} ${t.destinationFilePath} (${
              contents.length
            } bytes)`
          );
        } catch (error) {
          errorProcessingTemplates = true;
          console.log(`${chalk.red("ERROR")} ${t.destinationFilePath}`);
        }
      });

      if (errorProcessingTemplates) {
        console.log(`${chalk.red("ERROR")}: could not generate files`);
        yarg.exit(1, new Error("template error"));
      }

      const copyFiles: copyFileInfo[] = [
        {
          sourceFilePath: path.join(
            packageHomeFolderPath,
            "fonts",
            "roboto",
            "LICENSE.txt"
          ),
          destinationFilePath: path.join(
            newFolderPath,
            "fonts",
            "roboto",
            "LICENSE.txt"
          ),
        },
        {
          sourceFilePath: path.join(
            packageHomeFolderPath,
            "fonts",
            "roboto",
            "Roboto-Regular.ttf"
          ),
          destinationFilePath: path.join(
            newFolderPath,
            "fonts",
            "roboto",
            "Roboto-Regular.ttf"
          ),
        },
      ];

      let errorCopyingFiles = false;

      copyFiles.forEach((c) => {
        try {
          const bytesCopied = copyFile(c);
          console.log(
            `${chalk.green("COPY")} ${
              c.destinationFilePath
            } (${bytesCopied} bytes)`
          );
        } catch (error) {
          errorCopyingFiles = true;
          console.log(`${chalk.red("ERROR")} ${c.destinationFilePath}`);
        }
      });

      if (errorCopyingFiles) {
        console.log(`${chalk.red("ERROR")}: could not copy files`);
        yarg.exit(1, new Error("copy files error"));
      }

      const spinner = ora("Installing packages (npm)...").start();

      let npm: child_process.ChildProcessWithoutNullStreams;
      if (process.platform === "win32") {
        npm = spawn(`npm`, ["install"], { shell: true, cwd: newFolderPath });
      } else {
        npm = spawn(`npm`, ["install"], { cwd: newFolderPath });
      }

      let npmOut = "";

      npm.stdout.on("data", (data) => {
        npmOut = npmOut + data.toString();
      });
      npm.stderr.on("data", (data) => {
        npmOut = npmOut + data.toString();
      });
      npm.on("exit", (code) => {
        if (code === 0) {
          spinner.succeed("Packages installed successfully");
          console.log(`Created ${appName} at ${newFolderPath}`);
          console.log("Inside that directory, you can run several commands:\n");
          console.log(`  ${chalk.green("npm run serve")}`);
          console.log("    Starts the development server.\n");
          console.log(`  ${chalk.green("npm run build")}`);
          console.log("    Bundles the app for production.\n");
          console.log("We suggest you begin by typing:\n");
          console.log(`  ${chalk.green("cd")} ${appName}`);
          console.log(`  ${chalk.green("npm run serve")}`);
        } else {
          spinner.fail("Error during package installation");
          console.log(npmOut);
        }
      });
    }
  )
  //.command("build", "compiles to output directory named dist/")
  //.command("serve", "builds and serves app, rebuilding on files changes")
  .demandCommand()
  .strict()
  .showHelpOnFail(true).argv;
