import { exec } from "child_process";

const commands = [
  `npx schema-util list --schema=GameParameters --files=../packages/assessment-grid-memory/src/index.ts --format=json-schema --title="Grid Memory version __VERSION__" > static/schemas/grid-memory-parameter-schema.json`,
  `npx schema-util list --schema=TrialSchema --files=../packages/assessment-grid-memory/src/index.ts --format=json-schema --title="Grid Memory version __VERSION__" > static/schemas/grid-memory-trial-schema.json`,
  `npx schema-util list --schema=GameParameters --files=../packages/assessment-symbol-search/src/index.ts --format=json-schema --title="Symbol Search version __VERSION__" > static/schemas/symbol-search-parameter-schema.json`,
  `npx schema-util list --schema=TrialSchema --files=../packages/assessment-symbol-search/src/index.ts --format=json-schema --title="Symbol Search version __VERSION__" > static/schemas/symbol-search-trial-schema.json`,
  `npx schema-util list --schema=GameParameters --files=../packages/assessment-color-shapes/src/index.ts --format=json-schema --title="Color Shapes version __VERSION__" > static/schemas/color-shapes-parameter-schema.json`,
  `npx schema-util list --schema=TrialSchema --files=../packages/assessment-color-shapes/src/index.ts --format=json-schema --title="Color Shapes version __VERSION__" > static/schemas/color-shapes-trial-schema.json`,
  `npx schema-util list --schema=GameParameters --files=../packages/assessment-color-dots/src/index.ts --format=json-schema --title="Color Dots version __VERSION__" > static/schemas/color-dots-parameter-schema.json`,
  `npx schema-util list --schema=TrialSchema --files=../packages/assessment-color-dots/src/index.ts --format=json-schema --title="Color Dots version __VERSION__" > static/schemas/color-dots-trial-schema.json`,
];

const runCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        console.error(`Error executing command "${cmd}": ${error.message}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const runAllCommands = async () => {
  try {
    await Promise.all(commands.map(runCommand));
  } catch (error) {
    throw new Error("One or more schema generation commands failed.");
  }
};

runAllCommands();
