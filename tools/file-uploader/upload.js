/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const { resolve } = require("path");
const { readdir } = require("fs").promises;
const readlineSync = require("readline-sync");

// https://stackoverflow.com/a/45130990
const getFilenamesRecursive = async (dir) => {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilenamesRecursive(res) : res;
    })
  );
  return Array.prototype.concat(...files);
};

const generateStudyCode = () => {
  let result = "";
  // omit I, 1, O, and 0 due to potential confusion
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const uploadFile = async (
  serverUrl,
  userPw,
  studyCode,
  fileContent,
  filename
) => {
  const basename = path.basename(filename);
  let folderName = filename.replace(basename, "");
  folderName = folderName.replace(/\/$/, ""); // no trailing slash
  console.log(`uploading ${filename}`);

  const form = new FormData();
  form.append("folder", folderName);
  form.append("file", fileContent, filename);
  const userPwBase64 = Buffer.from(userPw, "utf-8").toString("base64");
  const uploadUrl = `${serverUrl}/api/studies/${studyCode}/files`;
  return axios.post(uploadUrl, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Basic ${userPwBase64}`,
    },
  });
};

const args = process.argv.slice(2);
if (args.length > 0 && args[0] === "--reset") {
  fs.rmSync(
    path.join(require("os").homedir(), ".m2c2-file-uploader-settings.json"),
    {
      force: true,
    }
  );
  process.exit(0);
}

let settings = {};
try {
  settings = JSON.parse(
    fs.readFileSync(
      path.join(require("os").homedir(), ".m2c2-file-uploader-settings.json"),
      {
        encoding: "utf8",
        flag: "r",
      }
    )
  );
} catch (e) {
  const uploadPath = readlineSync.question(
    "full upload path on this computer: "
  );
  const serverUrl = readlineSync.question("demo-server url: ");
  const username = readlineSync.question("demo-server username: ");
  const pw = readlineSync.question("demo-server password: ");
  settings = {
    rootDirectoryPath: uploadPath.replace(/\\/g, "/"),
    serverUrl: serverUrl.replace(/\/$/, ""), // no trailing slash
    userPw: username + ":" + pw,
  };
  fs.writeFileSync(
    path.join(require("os").homedir(), ".m2c2-file-uploader-settings.json"),
    JSON.stringify(settings)
  );
}

let studyCode = "";
try {
  studyCode = JSON.parse(
    fs.readFileSync(
      path.join(settings.rootDirectoryPath, ".m2c2-study-code.json"),
      {
        encoding: "utf8",
        flag: "r",
      }
    )
  ).studyCode;
} catch (e) {
  studyCode = generateStudyCode();
  fs.writeFileSync(
    path.join(settings.rootDirectoryPath, ".m2c2-study-code.json"),
    JSON.stringify({ studyCode: studyCode })
  );
}

const uploadRequests = [];
getFilenamesRecursive(settings.rootDirectoryPath).then((files) => {
  files = files
    .filter((file) => path.basename(file) !== ".m2c2-study-code.json")
    .map((file) => file.replace(/\\/g, "/"));
  files.forEach((file) => {
    const fileBuffer = fs.readFileSync(file);
    let filename = file;
    if (file.startsWith(settings.rootDirectoryPath)) {
      filename = file.slice(settings.rootDirectoryPath.length);
      if (filename.startsWith("/")) {
        filename = filename.slice(1);
      }
    }
    uploadRequests.push(
      uploadFile(
        settings.serverUrl,
        settings.userPw,
        studyCode,
        fileBuffer,
        filename
      )
    );
  });

  const activityIndicator = setInterval(() => {
    process.stdout.write(".");
  }, 1000);

  Promise.all(uploadRequests).then(() => {
    clearInterval(activityIndicator);
    console.log("done");
    console.log(
      `Study can be viewed with browser at ${settings.serverUrl}/studies/${studyCode}`
    );
  });
});

// In a prior version, I computed sha1 hash locally. Not doing this anymore.
//const crypto = require("crypto");
// fs.readdir(settings.rootDirectoryPath, function (err, files) {
//   if (err) {
//     console.log("Unable read directory: " + err);
//     return;
//   }

//   const resources = [];
//   const uploadRequests = [];
//   files.forEach(function (file) {

//     const fullFilePath = path.join(settings.rootDirectoryPath, file);
//     //const stats = fs.statSync(fullFilePath);
//     const fileBuffer = fs.readFileSync(fullFilePath);
//     // const hash = crypto.createHash("sha256");
//     // hash.update(fileBuffer);
//     // const hexDigest = hash.digest("hex");
//     // resources.push({
//     //   filename: file,
//     //   modified: Math.round(stats.mtimeMs),
//     //   sha256: hexDigest,
//     // });
//     //uploadRequests.push(uploadFile(fileBuffer, file));
//     console.log(`Uploading ${file}`);
//   });

//   Promise.all(uploadRequests).then(() => {
//     console.log("Done.");
//     // const fileContent = Buffer.from(JSON.stringify(resources), "utf8");
//     // const filename = "m2c2FileResources.json";
//     // uploadFile(fileContent, filename);
//   });
// });
