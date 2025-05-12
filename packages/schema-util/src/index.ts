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
import findupSync from "findup-sync";

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
          f,
        )}, ${shortCommitHash}`;
        const assessmentName = `${getAssessmentNameFromSourceFile(
          f,
        )} (${assessmentVersion})`;

        let trialSchema: M2c2Schema | undefined | null = undefined;
        let parametersSchema: M2c2Schema | undefined | null = undefined;
        let scoringSchema: M2c2Schema | undefined | null = undefined;

        if (
          argv.schema === "TrialSchema" ||
          (argv.schema as string).toLowerCase() === "all"
        ) {
          trialSchema = getSchemaFromSourceFile(f, "TrialSchema");
          if (trialSchema === null) {
            // no TrialSchema is a fatal error
            process.stderr.write(
              `No declaration for variable of type TrialSchema found in ${f}` +
                EOL,
            );
            process.exit(1);
          }
          let automaticTrialSchema: object;
          if (!argv["game-class"]) {
            automaticTrialSchema = getAutomaticSchemaFromCorePackage("Trial");
          } else {
            automaticTrialSchema = getAutomaticSchemaFromSourceFile(
              argv["game-class"].toString(),
              "Trial",
            );
          }
          trialSchema = { ...automaticTrialSchema, ...trialSchema };
        }
        if (
          argv.schema === "ScoringSchema" ||
          (argv.schema as string).toLowerCase() === "all"
        ) {
          scoringSchema = getSchemaFromSourceFile(f, "ScoringSchema");
          if (scoringSchema) {
            let automaticScoringSchema: object;
            if (!argv["game-class"]) {
              automaticScoringSchema =
                getAutomaticSchemaFromCorePackage("Scoring");
            } else {
              automaticScoringSchema = getAutomaticSchemaFromSourceFile(
                argv["game-class"].toString(),
                "Scoring",
              );
            }
            scoringSchema = { ...automaticScoringSchema, ...scoringSchema };
          } else {
            // no ScoringSchema is not a fatal error, because not all assessments
            // have scoring
            scoringSchema = undefined;
          }
        }
        if (
          argv.schema === "GameParameters" ||
          (argv.schema as string).toLowerCase() === "all"
        ) {
          parametersSchema = getSchemaFromSourceFile(f, "GameParameters");
          if (parametersSchema === null) {
            // no GameParameters is a fatal error
            process.stderr.write(
              `No declaration for variable of type GameParameters found in ${f}` +
                EOL,
            );
            process.exit(1);
          }
        }

        if (outputFormat === "json") {
          if ((argv.schema as string).toLowerCase() === "all") {
            process.stderr.write(
              "--schema=all is valid only for json-schema output",
            );
            process.exit(1);
          }
          const schema = trialSchema ?? parametersSchema ?? scoringSchema;
          if (schema !== undefined) {
            dataJson.push(schema);
          }
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

          if (
            argv.schema === "TrialSchema" ||
            argv.schema === "GameParameters" ||
            argv.schema === "ScoringSchema"
          ) {
            if (argv.schema === "TrialSchema") {
              description = "Trial data schema";
            } else if (argv.schema === "GameParameters") {
              description = "Game parameters schema";
            } else if (argv.schema === "ScoringSchema") {
              description = "Scoring data schema";
            }

            jsonSchema = {
              $schema: "http://json-schema.org/draft-07/schema",
              title: title,
              type: "object",
              description: description,
              properties:
                trialSchema ?? parametersSchema ?? scoringSchema ?? undefined,
            };
            return;
          }

          // all schemas in one json schema
          jsonSchema = {
            $schema: "http://json-schema.org/draft-07/schema",
            title: title,
            type: "object",
            description: "All game schemas",
            properties: {
              GameParameters: {
                type: "object",
                description: "Game parameters schema",
                properties: parametersSchema,
              },
              TrialSchema: {
                type: "object",
                description: "Trial data schema",
                properties: trialSchema,
              },
              ScoringSchema:
                scoringSchema !== undefined
                  ? {
                      type: "object",
                      description: "Scoring data schema",
                      properties: scoringSchema,
                    }
                  : undefined,
            },
          };
          return;
        }

        // csv format
        if ((argv.schema as string).toLowerCase() === "all") {
          process.stderr.write(
            "--schema=all is valid only for json-schema output",
          );
          process.exit(1);
        }

        const schema = trialSchema ?? parametersSchema ?? scoringSchema ?? {};
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
          data.push({
            schema: argv.schema,
            assessment: assessmentName,
            property: k,
            type: typeString,
            default:
              argv.schema === "GameParameters" ? schema[k].default : undefined,
            format: schema[k].format,
            enum: enumString,
            description: schema[k].description,
            json: JSON.stringify(schema[k]),
          });
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
    },
  )
  .option("schema", {
    type: "string",
    description:
      "schema type: TrialSchema, GameParameters, ScoringSchema or all (all valid only for json-schema output)",
    demandOption: true,
  })
  .option("files", {
    type: "string",
    description: "comma-delimited list of assessment sources",
    demandOption: true,
  })
  .option("game-class", {
    type: "string",
    description:
      "Game.ts assessment source. Used for --schema=TrialSchema and --schema=all. If it is not provided, the @m2c2kit/core JavaScript bundle will automatically be located and used",
  })
  .option("format", {
    type: "string",
    default: "csv",
    description: "output format: csv, json, or json-schema",
  })
  .option("title", {
    type: "string",
    default: "",
    description: "title of json schema",
  })
  .demandCommand(1, "You need at least one command")
  .parse();

/**
 * Gets automatic schema from the core package
 *
 * @param schemaType - The type of schema to retrieve: `Trial` or `Scoring`.
 * `GameParameters` do not have automatic schema.
 * @returns The schema object
 */
function getAutomaticSchemaFromCorePackage(
  schemaType: "Trial" | "Scoring",
): object {
  const propertyName = `automatic${schemaType}Schema`;

  const coreBundle = findupSync("node_modules/@m2c2kit/core/dist/index.js");
  if (!coreBundle) {
    process.stderr.write(
      "Could not resolve @m2c2kit/core package. This is required if --game-class is omitted.",
    );
    process.exit(1);
  }

  const project = new Project();
  const file = project.addSourceFileAtPath(coreBundle);
  const gameClass = file
    .getClasses()
    .filter((c) => c.getName() === "Game")
    .find(Boolean);
  if (!gameClass) {
    process.stderr.write(`No Game class found in ${coreBundle}` + EOL);
    process.exit(1);
  }

  const binaryExpression = gameClass
    .getDescendantsOfKind(SyntaxKind.BinaryExpression)
    .filter((d) => d.getLeft().getText() === `this.${propertyName}`)
    .find(Boolean);
  if (!binaryExpression) {
    process.stderr.write(
      `No ${propertyName} property found in file ${coreBundle}`,
    );
    process.exit(1);
  }

  const rightExpression = binaryExpression.getRight();
  if (rightExpression.getKind() === SyntaxKind.ObjectLiteralExpression) {
    const schemaString = rightExpression.getText();
    const schema = eval("(" + schemaString + ")");
    return schema as object;
  }

  process.stderr.write(
    `Could not get ${propertyName} from file ${coreBundle}` + EOL,
  );
  process.exit(1);
}

/**
 * Gets automatic schema from a source file
 *
 * @param sourceFile - Path to the Game.ts source file
 * @param schemaType - The type of schema to retrieve: `Trial` or `Scoring`.
 * `GameParameters` do not have automatic schema.
 * @returns The schema object
 */
function getAutomaticSchemaFromSourceFile(
  sourceFile: string,
  schemaType: "Trial" | "Scoring",
): object {
  const propertyName = `automatic${schemaType}Schema`;
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
  const schemaDeclaration = gameClass
    .getChildrenOfKind(SyntaxKind.PropertyDeclaration)
    .filter((d) => d.getName() === propertyName)
    .find(Boolean);
  if (!schemaDeclaration) {
    process.stderr.write(
      `No ${propertyName} property found in Game class at ${sourceFile}`,
    );
    process.exit(1);
  }
  const schemaString = schemaDeclaration
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getText();
  const schema = eval("(" + schemaString + ")");
  return schema as object;
}

/**
 * Gets schema from a source file.
 *
 * @param sourceFile - Path to the TypeScript source file
 * @param schemaName - The name of the schema to retrieve
 * @returns The schema object or null if not found
 */
function getSchemaFromSourceFile(
  sourceFile: string,
  schemaName: "TrialSchema" | "GameParameters" | "ScoringSchema",
): M2c2Schema | null {
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
    (f) => f.getTypeNode()?.getText() === schemaName,
  );
  if (!declaration) {
    return null;
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
    (f) => f.getTypeNode()?.getText() === "GameOptions",
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
    "package.json",
  );
  if (!fs.existsSync(packageJsonPath)) {
    process.stderr.write(
      `Could not find assessment package.json at ${packageJsonPath}` + EOL,
    );
    process.exit(1);
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}
