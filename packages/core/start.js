import { execSync } from "child_process";
import process from "process";

const args = process.argv
  .slice(2)
  .filter((a) => a !== "--testLocationInResults");
//console.log(JSON.stringify(args));
console.log(
  `going to execute set NODE_OPTIONS=--experimental-vm-modules&&npx jest ${args.join(
    " "
  )}`
);
//execSync(`set NODE_OPTIONS=--experimental-vm-modules&&npx jest ${args.join(" ")}`, {env: { "NODE_OPTIONS": "--experimental-vm-modules"}, stdio: [0,0,0]});
execSync(
  `set NODE_OPTIONS=--experimental-vm-modules&&npx jest ${args.join(" ")}`,
  { stdio: [process.stdin, process.stdout, process.stderr] }
);
process.exit(0);
