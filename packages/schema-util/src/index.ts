#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { SyntaxKind, Project } from "ts-morph";
import { stringify, Input } from "csv-stringify/sync";
import { M2c2Schema } from "./schemas.js";
import path from "path";
import fs from "fs";
import "process";
import { EOL } from "os";
import child_process from "child_process";

let shortCommitHash: string;
try {
  shortCommitHash = child_process
    .execSync("git rev-parse HEAD")
    .toString()
    .trim()
    .slice(0, 8);
} catch {
  // in case it is being run outside of a git repo
  shortCommitHash = "";
}

yargs(hideBin(process.argv))
  .command(
    "list",
    "list schema used in m2c2kit assessment source files",
    (yargs) => {
      return yargs;
    },
    (argv) => {
      const filePaths = (argv.files as string)
        .split(",")
        .map((f) => path.resolve(process.cwd(), f));
      const outputFormat = argv.format as string;
      const data: Input = [];
      const dataJson: Array<M2c2Schema> = [];
      let jsonSchema = {};

      filePaths.forEach((f) => {
        if (!fs.existsSync(f)) {
          process.stderr.write(`File ${f} does not exist` + EOL);
          process.exit(1);
        }

        const assessmentVersion = `${getAssessmentVersion(
          f
        )}, ${shortCommitHash}`;
        const assessmentName = `${getAssessmentNameFromSourceFile(
          f
        )} (${assessmentVersion})`;

        let schema = getSchemaFromSourceFile(f, argv.schema as string);

        if (argv.schema === "TrialSchema") {
          if (!argv["game-class"]) {
            process.stderr.write(
              "--game-class option is required for TrialSchema"
            );
            process.exit(1);
          }
          const automaticTrialSchema = getAutomaticTrialSchemaFromSourceFile(
            argv["game-class"].toString()
          );
          schema = { ...automaticTrialSchema, ...schema };
        }

        if (outputFormat === "json") {
          dataJson.push(schema);
          return;
        }

        if (outputFormat === "json-schema") {
          let title: string | undefined = argv.title as string;
          if (!title) {
            title = undefined;
          } else {
            title = title.replace("__VERSION__", assessmentVersion);
          }
          let description = "";
          if (argv.schema === "TrialSchema") {
            description = "Trial data schema";
          } else if (argv.schema === "GameParameters") {
            description = "Game parameters schema";
          }

          jsonSchema = {
            $schema: "http://json-schema.org/draft-07/schema",
            title: title,
            type: "object",
            description: description,
            properties: schema,
          };
          return;
        }

        // csv format
        Object.keys(schema).forEach((k) => {
          const type = schema[k].type;
          let typeString;
          if (Array.isArray(type)) {
            typeString = type.join(",");
          } else {
            typeString = type;
          }
          const _enum = schema[k].enum?.map((e) => (e === null ? "null" : e));
          let enumString;
          if (Array.isArray(_enum)) {
            enumString = _enum.join(",");
          } else {
            enumString = _enum;
          }
          if (argv.schema === "GameParameters") {
            data.push({
              schema: argv.schema,
              assessment: assessmentName,
              property: k,
              type: typeString,
              default: schema[k].default,
              format: schema[k].format,
              enum: enumString,
              description: schema[k].description,
              json: JSON.stringify(schema[k]),
            });
          } else {
            data.push({
              schema: argv.schema,
              assessment: assessmentName,
              property: k,
              type: typeString,
              format: schema[k].format,
              enum: enumString,
              description: schema[k].description,
              json: JSON.stringify(schema[k]),
            });
          }
        });
      });

      if (outputFormat === "json") {
        process.stdout.write(JSON.stringify(dataJson, null, 2));
        return;
      }

      if (outputFormat === "json-schema") {
        process.stdout.write(JSON.stringify(jsonSchema, null, 2));
        return;
      }
      // csv
      process.stdout.write(stringify(data, { header: true }) + EOL);
    }
  )
  .option("schema", {
    type: "string",
    description: "schema type: TrialSchema or GameParameters",
    demandOption: true,
  })
  .option("files", {
    type: "string",
    description: "comma-delimited list of assessment sources",
    demandOption: true,
  })
  .option("game-class", {
    type: "string",
    description: "Game.ts assessment source. Required for --schema=TrialSchema",
  })
  .option("format", {
    type: "string",
    default: "csv",
    description: "output format: csv or json",
  })
  .option("title", {
    type: "string",
    default: "",
    description: "title of json schema",
  })
  .demandCommand(1, "You need at least one command")
  .parse();

function getAutomaticTrialSchemaFromSourceFile(sourceFile: string) {
  const project = new Project();
  const file = project.addSourceFileAtPath(sourceFile);
  const gameClass = file
    .getClasses()
    .filter((c) => c.getName() === "Game")
    .find(Boolean);
  if (!gameClass) {
    process.stderr.write(`No Game class found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const automaticTrialSchemaDeclaration = gameClass
    .getChildrenOfKind(SyntaxKind.PropertyDeclaration)
    .filter((d) => d.getName() === "automaticTrialSchema")
    .find(Boolean);
  if (!automaticTrialSchemaDeclaration) {
    process.stderr.write(
      "No automaticTrialSchema property found in Game class at " + sourceFile
    );
    process.exit(1);
  }
  const schemaString = automaticTrialSchemaDeclaration
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getText();
  const schema = eval("(" + schemaString + ")");
  return schema;
}

function getSchemaFromSourceFile(
  sourceFile: string,
  schemaName: string
): M2c2Schema {
  const project = new Project();
  const file = project.addSourceFileAtPath(sourceFile);
  const gameClass = file
    .getClasses()
    .filter((c) => c.getBaseClass()?.getName() === "Game")
    .find(Boolean);
  if (!gameClass) {
    process.stderr.write(`No Game class found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const ctor = gameClass.getConstructors().find(Boolean);
  if (!ctor) {
    process.stderr.write(`No constructor found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const declaration = ctor.getVariableDeclaration(
    (f) => f.getTypeNode()?.getText() === schemaName
  );
  if (!declaration) {
    process.stderr.write(`No declaration found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const schemaString = declaration
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getText();
  const schema = eval("(" + schemaString + ")");
  return schema;
}

function getAssessmentNameFromSourceFile(sourceFile: string): string {
  const project = new Project();
  const file = project.addSourceFileAtPath(sourceFile);
  const gameClass = file
    .getClasses()
    .filter((c) => c.getBaseClass()?.getName() === "Game")
    .find(Boolean);
  if (!gameClass) {
    process.stderr.write(`No Game class found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const ctor = gameClass.getConstructors().find(Boolean);
  if (!ctor) {
    process.stderr.write(`No constructor found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const declaration = ctor.getVariableDeclaration(
    (f) => f.getTypeNode()?.getText() === "GameOptions"
  );
  if (!declaration) {
    process.stderr.write(`No declaration found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  const gameOptionsString = declaration
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getText();
  // why regex? gameOptions has references to JS Objects, thus we can't eval it
  const match = gameOptionsString.match(/name:\s*"(?<name>[^"]*)"/);

  if (!match || !match.groups?.name) {
    process.stderr.write(`No assessment name found in ${sourceFile}` + EOL);
    process.exit(1);
  }
  return match.groups.name;
}

function getAssessmentVersion(sourceFile: string): string {
  const packageJsonPath = path.resolve(
    path.dirname(sourceFile),
    "..",
    "package.json"
  );
  if (!fs.existsSync(packageJsonPath)) {
    process.stderr.write(
      `Could not find assessment package.json at ${packageJsonPath}` + EOL
    );
    process.exit(1);
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}
