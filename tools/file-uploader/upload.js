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

// rollup-plugin-livereload injects some change detection code, which is
// useful for local development, but causes a timeout when deployed to
// a server. this function will remove it
const removeLiveReload = (fileBuffer) => {
  const s = fileBuffer.toString();
  let lines = s.match(/^.*([\n\r]+|$)/gm);
  lines = lines.filter(
    (line) => line.indexOf(`getElementById('livereloadscript')`) === -1
  );
  return Buffer.from(lines.join("\n"));
};

const args = process.argv.slice(2);
if (args.length > 0 && args[0] === "--reset") {
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
    if (settings.rootDirectoryPath) {
      settings.rootDirectoryPathOld = settings.rootDirectoryPath;
      delete settings.rootDirectoryPath;
    }

    if (settings.serverUrl) {
      settings.serverUrlOld = settings.serverUrl;
      delete settings.serverUrl;
    }

    if (settings.userPw) {
      settings.userPwOld = settings.userPw;
      delete settings.userPw;
    }

    fs.writeFileSync(
      path.join(require("os").homedir(), ".m2c2-file-uploader-settings.json"),
      JSON.stringify(settings)
    );
  } catch (e) {
    fs.rmSync(
      path.join(require("os").homedir(), ".m2c2-file-uploader-settings.json"),
      {
        force: true,
      }
    );
  }

  console.log("upload settings reset.");
  process.exit(0);
}

const extractUser = (userPw) => {
  const pos = userPw?.indexOf(":");
  if (pos === -1 || !pos) {
    return undefined;
  }
  return userPw.slice(0, pos);
};

const extractPw = (userPw) => {
  const pos = userPw?.indexOf(":");
  if (pos === -1 || !pos) {
    return undefined;
  }
  return userPw.slice(pos + 1);
};

const getSettingsFromUser = (settings) => {
  if (!settings.rootDirectoryPath) {
    let returnMsg = "";
    if (settings.rootDirectoryPathOld) {
      returnMsg = ` (return for ${settings.rootDirectoryPathOld})`;
    }
    let rootDirectoryPath = readlineSync.question(
      `full upload path on this computer${returnMsg}: `
    );
    if (!rootDirectoryPath && settings.rootDirectoryPathOld) {
      settings.rootDirectoryPath = settings.rootDirectoryPathOld;
    } else {
      settings.rootDirectoryPath = rootDirectoryPath;
    }
  } else {
    console.log(`uploading from ${settings.rootDirectoryPath}`);
  }

  if (!settings.serverUrl) {
    let returnMsg = "";
    if (settings.serverUrlOld) {
      returnMsg = ` (return for ${settings.serverUrlOld})`;
    }
    let serverUrl = readlineSync.question(`demo-server url${returnMsg}: `);
    if (!serverUrl && settings.serverUrlOld) {
      settings.serverUrl = settings.serverUrlOld;
    } else {
      settings.serverUrl = serverUrl;
    }
  } else {
    console.log(`demo-server url is ${settings.serverUrl}`);
  }

  if (!extractPw(settings.userPw) || !extractUser(settings.userPw)) {
    let returnMsg = "";
    if (extractUser(settings.userPwOld)) {
      returnMsg = ` (return for ${extractUser(settings.userPwOld)})`;
    }
    let username = readlineSync.question(`demo-server username${returnMsg}: `);
    if (!username && extractUser(settings.userPwOld)) {
      username = extractUser(settings.userPwOld);
    }

    returnMsg = "";
    if (extractPw(settings.userPwOld)) {
      returnMsg = ` (return for ${extractPw(settings.userPwOld)})`;
    }
    let pw = readlineSync.question(`demo-server password${returnMsg}: `);
    if (!pw && extractPw(settings.userPwOld)) {
      pw = extractPw(settings.userPwOld);
    }
    settings.userPw = `${username}:${pw}`;
  }

  return settings;
};

let settings = {};
let askForSettings = false;
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
  askForSettings = true;
}

if (
  askForSettings ||
  !settings.rootDirectoryPath ||
  !settings.serverUrl ||
  !extractPw(settings.userPw) ||
  !extractUser(settings.userPw)
) {
  settings = getSettingsFromUser(settings);
  // const uploadPath = readlineSync.question(
  //   "full upload path on this computer: "
  // );
  // const serverUrl = readlineSync.question("demo-server url: ");
  settings = {
    rootDirectoryPath: settings.rootDirectoryPath.replace(/\\/g, "/"),
    serverUrl: settings.serverUrl.replace(/\/$/, ""), // no trailing slash
    userPw: settings.userPw,
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

const excludedFromUpload = (file) => {
  const patterns = [
    "\\.gitignore$",
    "\\.m2c2-study-code\\.json$",
    "rollup\\..*config\\.js$",
    "serve\\.sh$",
    "\\.*\\.ts$",
  ];
  return patterns
    .map((pattern) => {
      const regex = new RegExp(pattern);
      return regex.test(file);
    })
    .some((val) => val === true);
};

const uploadRequests = [];
getFilenamesRecursive(settings.rootDirectoryPath).then((files) => {
  files = files
    .filter((file) => !excludedFromUpload(file))
    .map((file) => file.replace(/\\/g, "/"));
  files.forEach((file) => {
    let fileBuffer = fs.readFileSync(file);

    if (file.endsWith(".js")) {
      fileBuffer = removeLiveReload(fileBuffer);
    }

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
