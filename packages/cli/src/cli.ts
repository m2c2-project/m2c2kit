#!/usr/bin/env node

// https://github.com/yargs/yargs/issues/1854#issuecomment-792354121

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";
import child_process from "child_process";

import handlebars from "handlebars";

console.log(handlebars.VERSION);

import { dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const packageHomePathName = dirname(fileURLToPath(import.meta.url));

console.log(dirname(fileURLToPath(import.meta.url)));

const yarg = yargs(hideBin(process.argv));

// const argv = yargs(hideBin(process.argv))
//   .command("new <name>", "create a new m2c2kit app", (yarg) => {
//     yarg.positional("name", {
//       describe: "name of new app",
//       type: "string",
//     });
//     console.log("hi");
//   })
//   .command("build", "compiles to output directory named dist/")
//   .command("serve", "builds and serves app, rebuilding on files changes").argv

//console.log(JSON.stringify(argv));

const argv = yarg
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
      const newFolderPathName = path.join(path.resolve(), appName);
      console.log("will create " + newFolderPathName);

      // if (fs.existsSync(newFolderPathName)) {
      //     console.log(`error: folder ${newFolderPathName} already exists. please remove this folder and try again.`);
      //     yarg.exit(1, new Error("path exists"));
      // }

      //fs.mkdirSync(newFolderPathName);
      //fs.mkdirSync(path.join(newFolderPathName, "src"));

      function applyValuesToTemplate(
        packageHome: string,
        template: string,
        contents: any
      ) {
        const packageJsonTemplateContents = fs
          .readFileSync(path.join(packageHome, "templates", template))
          .toString();
        const packageJsonTemplate = handlebars.compile(
          packageJsonTemplateContents
        );
        const packageJsonContents = packageJsonTemplate(contents);
        return packageJsonContents;
      }

      const packageJsonContents = applyValuesToTemplate(
        packageHomePathName,
        "package.json.handlebars",
        { appName: appName }
      );
      fs.writeFileSync(
        path.join(newFolderPathName, "src", "package.json"),
        packageJsonContents
      );

      const indexHtmlContents = applyValuesToTemplate(
        packageHomePathName,
        "index.html.handlebars",
        { appName: appName }
      );
      fs.writeFileSync(
        path.join(newFolderPathName, "src", "index.html"),
        indexHtmlContents
      );

      const rollupConfigJsContents = applyValuesToTemplate(
        packageHomePathName,
        "rollup.config.js",
        { appName: appName }
      );
      fs.writeFileSync(
        path.join(newFolderPathName, "rollup.config.js"),
        rollupConfigJsContents
      );

      console.log(packageJsonContents);

      // const bat = spawn(`cd ${newFolderPathName} && npm init -y`, { shell: true});

      // bat.stdout.on('data', (data) => {
      //   console.log(data.toString());
      // });

      // bat.stderr.on('data', (data) => {
      //   console.error(data.toString());
      // });

      // bat.on('exit', (code) => {
      //   console.log(`Child exited with code ${code}`);
      // });
    }
  )
  .command("build", "compiles to output directory named dist/")
  .command("serve", "builds and serves app, rebuilding on files changes").argv;

console.log(JSON.stringify(argv));
