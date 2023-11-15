---
id: getting-started
sidebar_position: 3
hide_table_of_contents: true
---

# Getting Started

## No-install quickstart

---

Go to the m2c2kit [playground](/playground) to run assessments, examine code, and create new assessments in your web browser.

## Local install

---

Local install of a full m2c2kit development environment is recommended to create new assessments. A local install provides debugging, code bundling, TypeScript, and many other features that are not available in the playground. You can develop on Windows, Mac, or Linux.

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (version >=18; version 20 LTS recommended). **Required**.
- [Visual Studio Code](https://code.visualstudio.com/download). Recommended.
- [Google Chrome](https://www.google.com/chrome). Recommended.
- [Git](https://git-scm.com/downloads). Recommended.

### Installing and Using the Command Line Interface (CLI)

The CLI quickly scaffolds a demo app and serves it on your local machine.

First, install the CLI globally. You need to do this only once. From your command line:

```
npm install -g @m2c2kit/cli
```

<details style={{ backgroundColor: '#fdf6f6', border: '1px solid #f0b2b2' }}>
    <summary>😕 Problems?</summary>
    <p>If you saw a message similar to <code>Command 'npm' not found</code> or <code>'npm' is not recognized as an internal or external command, operable program or batch file.</code>, make sure you installed <a href="https://nodejs.org/en/download">Node.js</a>. You may need administrator privileges to do this.</p>
</details>

Second, create a new app. The executable name for the CLI is `m2`. We'll name this demo app `myapp`:

```
m2 new myapp
cd myapp
npm run serve
```

You can now browse to `http://localhost:3000` to view the demo app.

<details style={{ backgroundColor: '#fdf6f6', border: '1px solid #f0b2b2' }}>
    <summary>😕 Problems?</summary>
    <p>If you saw error messages after you typed <code>m2 new myapp</code>, make sure you installed the CLI in the first step above. Then, make sure you are not in a special, protected directory. For example, on Windows, the command line prompt might start in <code>c:\\windows</code> or <code>c:\\</code>, which you may not be able to write to. Try this:</p>
    <pre><code>
    mkdir c:\m2c2kit<br/>
    cd c:\m2c2kit<br/>
    m2 new myapp<br/>
    cd myapp<br/>
    npm run serve<br/>
    </code></pre>
</details>

## Local Development with Visual Studio Code

---

Visual Studio Code (VS Code) is a great editor for local m2c2kit development, and the CLI configures your app code to work with it.

After creating your app with the CLI, open your app in VS Code (`code .` opens the current folder in VS Code):

```
cd myapp
code .
```

If you are asked, "Do you trust the authors of the files in this folder?", click "Yes."

You can run NPM scripts directly in VS Code if you show the NPM Scripts explorer. Click the three dots in the upper right of the file explorer, and select "NPM Scripts":

import showNpmScriptExplorer from "@site/static/img/vs-code-show-npm-script-explorer.png";

<img src={showNpmScriptExplorer} style={{width: 325}} />

The NPM Scripts explorer is now visible.

### Running your app

To build and serve the app, in the NPM Scripts explorer click the triangle in the "serve" script:

import runServeScript from "@site/static/img/vs-code-run-serve-script.png";

<img src={runServeScript} style={{width: 250}} />

This serves the app locally on your computer. On Windows, the first time you do this, you may be asked to allow Node.js access to private and public networks. Enable both and click "Allow Access":

import firewallImage from "@site/static/img/windows-firewall-allow-node.png";

<img src={firewallImage} style={{width: 400}} />

To run the app in debug mode, show the Debug panel by clicking on the triangle with a bug on it. Then, click the launch button (green triangle). This will open a new browser window with the app running in debug mode:

import launchDebugging from "@site/static/img/vs-code-launch-debugging.png";

<img src={launchDebugging} style={{width: 220}} />

Note: the m2c2kit CLI configured VS Code to use the Chrome debugger. If Chrome is not installed, the launch will fail. To use a different browser, edit the `launch.json` file in the `.vscode` folder: For Edge, set the `type` to `msedge`. For Firefox, install the [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug) and follow the instructions to edit `launch.json`.

### Watch mode

The "serve" script automatically rebuilds your app when you save changes to your code ("watch mode").

In the example below, we launch the app. Then, in the file `index.ts` we change the heading on the first instructions page from "myapp" to "myapp is great". As soon as the file is saved, the app is rebuilt and reloaded in the browser:

import watchMode from "@site/static/img/watch-mode.gif";

<img src={watchMode} style={{width: 800}} />