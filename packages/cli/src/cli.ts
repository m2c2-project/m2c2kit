#!/usr/bin/env node

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
import prompts from "prompts";
import Conf from "conf";
import { resolve } from "path";
import { readdir } from "fs/promises";
import FormData from "form-data";
import axios from "axios";

// this is the path of our @m2c2kit/cli program
// our templates are stored under here
const packageHomeFolderPath = dirname(fileURLToPath(import.meta.url));

// we store the CLI version in .env. The .env file is created during the
// build process with the write-dotenv.js script
// I couldn't get dotenv working with a node cli, so just read it in with
// readFileSync()
let cliVersion: string;
try {
  cliVersion = fs
    .readFileSync(path.join(packageHomeFolderPath, ".env"))
    .toString()
    .split("=")[1];
} catch {
  cliVersion = "UNKNOWN";
}

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

interface serverConfig {
  url?: string;
  studyCode?: string;
}

interface m2c2kitServerCredentials {
  username: string;
  password: string;
}

// on the demo server, identify studies with a random 5 digit code
const generateStudyCode = () => {
  let result = "";
  // omit I, 1, O, and 0 due to potential confusion
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const yarg = yargs(hideBin(process.argv));

await yarg
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

      if (!isValidAppName(appName)) {
        console.error(
          `${chalk.red(
            "ERROR"
          )}: the name ${appName} is not valid. The name must be a valid JavaScript identifer (e.g., begin with a letter, $ or _; not contain spaces; not be a reserved word, etc.).`
        );
        yarg.exit(1, new Error("invalid name"));
      }
      const className = appName.charAt(0).toUpperCase() + appName.slice(1);

      const newFolderPath = path.join(path.resolve(), appName);

      if (fs.existsSync(newFolderPath)) {
        console.error(
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
        {
          templateFilePath: path.join(
            templateFolderPath,
            "m2c2kit.json.handlebars"
          ),
          destinationFilePath: path.join(newFolderPath, "m2c2kit.json"),
        },
      ];

      let errorProcessingTemplates = false;
      templates.forEach((t) => {
        try {
          const contents = applyValuesToTemplate(t.templateFilePath, {
            appName: appName,
            className: className,
            cliVersion: cliVersion,
            studyCode: generateStudyCode(),
          });
          fs.writeFileSync(t.destinationFilePath, contents);
          console.log(
            `${chalk.green("CREATE")} ${t.destinationFilePath} (${
              contents.length
            } bytes)`
          );
        } catch (error) {
          errorProcessingTemplates = true;
          console.error(`${chalk.red("ERROR")} ${t.destinationFilePath}`);
        }
      });
      if (errorProcessingTemplates) {
        console.error(`${chalk.red("ERROR")}: could not generate files`);
        yarg.exit(1, new Error("template error"));
      }

      // roboto is the default font we ship
      // it's Apache 2,, so OK to use as long as we include license
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
          console.error(`${chalk.red("ERROR")} ${c.destinationFilePath}`);
        }
      });
      if (errorCopyingFiles) {
        console.error(`${chalk.red("ERROR")}: could not copy files`);
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
      // node will wait for the npm process to exit. Thus,
      // this on exit listener is the last code we execute before
      // the "m2 new" command is done
      npm.on("exit", (code) => {
        if (code === 0) {
          spinner.succeed("Packages installed successfully");
          console.log(`Created ${appName} at ${newFolderPath}`);
          console.log("Inside that directory, you can run several commands:\n");
          console.log(`  ${chalk.green("npm run serve")}`);
          console.log("    Starts the development server.\n");
          console.log(`  ${chalk.green("npm run build")}`);
          console.log("    Bundles the app for production.\n");
          console.log(`  ${chalk.green("m2 upload")}`);
          console.log("    Uploads the app to a test server.\n");
          console.log("We suggest you begin by typing:\n");
          console.log(`  ${chalk.green("cd")} ${appName}`);
          console.log(`  ${chalk.green("npm run serve")}`);
        } else {
          spinner.fail("Error during package installation");
          console.log(npmOut);
          yarg.exit(1, new Error("npm install error"));
        }
      });
    }
  )
  // TODO: move npm script execution into this cli, so there's a single tool
  //.command("build", "compiles to output directory named dist/")
  //.command("serve", "builds and serves app, rebuilding on files changes")
  .command(
    "upload",
    "upload production build from dist/ to server",
    (yargs) => {
      yargs
        .option("url", {
          alias: "u",
          type: "string",
          description: "server url",
        })
        .option("studyCode", {
          alias: "s",
          type: "string",
          description:
            "study code. This 5-digit random alphanumeric code is automatically generated by the cli during the creation of a new app and stored in m2c2kit.json",
        })
        .option("remove", {
          alias: "r",
          type: "boolean",
          description: "remove saved server credentials from local machine",
        });
    },
    async (argv) => {
      const m2c2kitProjectConfig = new Conf({
        // store this config in the project folder, not user's  ~/.config
        cwd: ".",
        configName: "m2c2kit",
      });

      // store server credentials in user folder, not project folder
      // to avoid secrets getting into source control
      const m2c2kitUserConfig = new Conf({
        configName: "m2c2kit-cli-user",
        projectName: "m2c2kit-cli",
        projectSuffix: "",
        accessPropertiesByDotNotation: false,
      });

      if (argv["remove"] as unknown as boolean) {
        m2c2kitUserConfig.clear();
        console.log(
          `all server credentials removed from ${m2c2kitUserConfig.path}`
        );
        return;
      }

      let abort = false;
      let serverConfig: serverConfig;
      try {
        serverConfig = m2c2kitProjectConfig.get("server") as serverConfig;
      } catch {
        serverConfig = {};
      }

      // get url first from command line, then from config file, then assign blank
      let url = (argv["url"] as unknown as string) ?? serverConfig?.url ?? "";
      if (url === "") {
        const response = await prompts({
          type: "text",
          name: "url",
          message: "server url?",
          validate: (text) =>
            (text as unknown as string).length > 0
              ? true
              : "provide a valid server url (e.g., https://www.myserver.com)",
          onState: (state) => (abort = state.aborted === true),
        });
        url = response.url;
      }
      if (abort) {
        yarg.exit(1, new Error("user aborted"));
      }

      // get study code first from command line, then from config file, then generate new one
      const studyCode =
        (argv["studyCode"] as unknown as string) ??
        serverConfig?.studyCode ??
        generateStudyCode();

      // if new url or study code was provided, save these
      if (url !== serverConfig?.url || studyCode !== serverConfig?.studyCode) {
        m2c2kitProjectConfig.set("server", { url, studyCode } as serverConfig);
      }

      const serverCredentials = m2c2kitUserConfig.get(
        url
      ) as m2c2kitServerCredentials;

      let username = serverCredentials?.username ?? "";
      let writeCredentials = false;
      if (username === "") {
        const response = await prompts({
          type: "text",
          name: "username",
          message: `username for server at ${url}`,
          validate: (text) =>
            (text as unknown as string).length > 0
              ? true
              : "username cannot be empty",
          onState: (state) => (abort = state.aborted === true),
        });
        username = response.username;
        writeCredentials = true;
      }
      if (abort) {
        yarg.exit(1, new Error("user aborted"));
      }

      let password = serverCredentials?.password ?? "";
      if (password === "") {
        const response = await prompts({
          type: "password",
          name: "password",
          message: `password for server at ${url}`,
          validate: (text) =>
            (text as unknown as string).length > 0
              ? true
              : "password cannot be empty",
          onState: (state) => (abort = state.aborted === true),
        });
        password = response.password;
        writeCredentials = true;
      }
      if (abort) {
        yarg.exit(1, new Error("user aborted"));
      }

      if (writeCredentials) {
        m2c2kitUserConfig.set(url, {
          username,
          password,
        } as m2c2kitServerCredentials);
        console.log(
          `credentials (username, password) for server ${url} written to ${m2c2kitUserConfig.path}`
        );
      }

      const getFilenamesRecursive = async (dir: string): Promise<string[]> => {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(
          dirents.map((dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFilenamesRecursive(res) : res;
          })
        );
        return Array.prototype.concat(...files);
      };

      const uploadFile = async (
        serverUrl: string,
        userPw: string,
        studyCode: string,
        fileContent: Buffer,
        filename: string
      ) => {
        const basename = path.basename(filename);
        let folderName = filename.replace(basename, "");
        folderName = folderName.replace(/\/$/, ""); // no trailing slash

        const form = new FormData();
        form.append("folder", folderName);
        form.append("file", fileContent, filename);
        const userPwBase64 = Buffer.from(userPw, "utf-8").toString("base64");
        const uploadUrl = `${serverUrl}/api/studies/${studyCode}/files`;
        return axios.post(uploadUrl, form, {
          headers: {
            ...form.getHeaders(),
            // this uses basic auth because it's simply a demo server
            // but for production, a more robust auth must be used
            Authorization: `Basic ${userPwBase64}`,
          },
        });
      };

      const distFolder = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distFolder)) {
        console.error(
          `${chalk.red(
            "ERROR"
          )}: distribution folder not found. looked for ${distFolder}`
        );
        yarg.exit(1, new Error("no files"));
      }
      const files = await getFilenamesRecursive(distFolder);
      if (files.length === 0) {
        console.error(
          `${chalk.red("ERROR")}: no files for upload in ${distFolder}`
        );
        yarg.exit(1, new Error("no files"));
      }

      const uploadRequests = files.map((file) => {
        let relativeName = file;
        if (relativeName.startsWith(distFolder)) {
          relativeName = relativeName.slice(distFolder.length);
          // on server, normalize all paths to forward slash
          relativeName = relativeName.replace(/\\/g, "/");
          if (relativeName.startsWith("/")) {
            relativeName = relativeName.slice(1);
          }
        }
        const fileBuffer = fs.readFileSync(file);

        return uploadFile(
          url,
          `${username}:${password}`,
          studyCode,
          fileBuffer,
          relativeName
        );
      });

      const spinner = ora(`Uploading files to ${url}...`).start();

      Promise.all(uploadRequests)
        .then(() => {
          spinner.succeed(`All files uploaded from ${distFolder}`);
          console.log(
            `Study can be viewed with browser at ${url}/studies/${studyCode}`
          );
        })
        .catch((error) => {
          spinner.fail(`Failed uploading files from ${distFolder}`);
          console.error(`${chalk.red("ERROR")}: ${error}`);
          yarg.exit(1, new Error("upload error"));
        });
    }
  )
  .demandCommand()
  .strict()
  // seems to have problems getting version automatically; thus I explicity
  // provide
  .version(cliVersion)
  .showHelpOnFail(true).argv;

function isValidAppName(name: string): boolean {
  const reserved = [
    "abstract",
    "arguments",
    "await",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "double",
    "else",
    "enum",
    "eval",
    "export",
    "extends",
    "false",
    "final",
    "finally",
    "float",
    "for",
    "function",
    "goto",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "int",
    "interface",
    "let",
    "long",
    "native",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "volatile",
    "while",
    "with",
    "yield",
  ];

  const builtin = [
    "Array",
    "Date",
    "eval",
    "function",
    "hasOwnProperty",
    "Infinity",
    "isFinite",
    "isNaN",
    "isPrototypeOf",
    "length",
    "Math",
    "name",
    "NaN",
    "Number",
    "Object",
    "prototype",
    "String",
    "toString",
    "undefined",
    "valueOf",
  ];

  if (reserved.includes(name) || builtin.includes(name)) {
    return false;
  }

  const re = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
  if (!re.test(name)) {
    return false;
  }

  return true;
}
