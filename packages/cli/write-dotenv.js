import fs from "fs";
const { version } = JSON.parse(fs.readFileSync("./package.json"));
fs.writeFileSync("dist/.env", `CLI_VERSION=${version}`);
