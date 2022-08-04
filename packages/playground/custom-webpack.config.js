// eslint-disable-next-line no-undef, @typescript-eslint/no-var-requires
const { Buffer } = require("buffer");
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const CopyPlugin = require("copy-webpack-plugin");

/**
 * Some assets need to be modified before they will work in the browser.
 * Note: in earlier approach (commit e5ea899dba5378331eac710d2a3afdc5f72ee03b),
 * I used a custom WebPack plugin to modify the assets, but for an unknown
 * reason this worked only in development (ng serve) and not production
 * (ng build).
 */

/**
 * The index.js has been built with an import to m2c2 core as
 * @m2c2kit/core, but this needs to be changed to a URL path
 * to work in the browser.
 */
const replaceStringInBuffer = (buffer, search, replace) =>
  Buffer.from(buffer.toString("utf8").replace(search, replace), "utf8");

/**
 * The assessment TypeScript source code is just the class for the
 * assessment, and not the supporting code to add the assessment to
 * the session, start, and handle events. We add this supporting code so a
 * runnable test can be executed in the browser.
 */
const addBoilerplateCodeToAssessment = (buffer, className) => {
  let code =
    buffer.toString("utf8") +
    `const activity = new ${className}();\n` +
    sessionCode;

  code = code
    .replace(
      '} from "@m2c2kit/core";',
      `  Session,
  SessionLifecycleEvent,
  ActivityDataEvent,
  ActivityLifecycleEvent,
  ActivityType,
} from "@m2c2kit/core";`
    )
    .replace(`export { ${className} };`, "");

  return Buffer.from(code, "utf8");
};

/**
 * These were formerly handled in angular.json, but that approach with the
 * compiler hook did not work in production build.
 */
const CopyPluginPatterns = [
  { from: "src/favicon.ico", to: "favicon.ico" },
  { from: "./node_modules/monaco-editor", to: "assets/monaco-editor" },
  {
    from: "index.html",
    to: "assets",
    context: "./../core",
    transform(content) {
      return replaceStringInBuffer(
        content,
        `  <script type="module" src="./index.js" async></script>\n`,
        ""
      );
    },
  },
  { from: "./../core/assets/css", to: "assets/css" },
  {
    from: "canvaskit.wasm",
    to: "assets",
    context: "./../../node_modules/canvaskit-wasm/bin",
  },
  {
    from: "index.d.ts",
    to: "assets/canvaskit-wasm",
    context: "./../../node_modules/canvaskit-wasm/types",
  },
  { from: "index.*", to: "assets/m2c2kit/core", context: "./../core/dist" },
  {
    from: "index.*",
    to: "assets/m2c2kit/addons",
    context: "./../addons/dist",
    transform(content) {
      return replaceStringInBuffer(
        content,
        "@m2c2kit/core",
        "./../core/index.js"
      );
    },
  },
  {
    from: "index.*",
    to: "assets/m2c2kit/sage-research",
    context: "./../sage-research/dist",
    transform(content) {
      return replaceStringInBuffer(
        content,
        "@m2c2kit/core",
        "./../core/index.js"
      );
    },
  },
  {
    from: "index.*",
    to: "assets/m2c2kit/survey",
    context: "./../survey/dist",
    transform(content) {
      const c1 = replaceStringInBuffer(
        content,
        "@m2c2kit/core",
        "./../core/index.js"
      );
      return replaceStringInBuffer(
        c1,
        "import * as SurveyKO from 'survey-knockout';",
        "declare namespace SurveyKO { class Survey {} }"
      );
    },
  },
  {
    from: "index.ts",
    to: "assets/src/cli-starter",
    context: "./../assessment-cli-starter/src",
    transform(content) {
      return addBoilerplateCodeToAssessment(content, "CliStarter");
    },
  },
  {
    from: "./../assessment-cli-starter/assets/cli-starter",
    to: "assets/cli-starter",
  },
  {
    from: "index.ts",
    to: "assets/src/color-dots",
    context: "./../assessment-color-dots/src",
    transform(content) {
      return addBoilerplateCodeToAssessment(content, "ColorDots");
    },
  },
  {
    from: "./../assessment-color-dots/assets/color-dots",
    to: "assets/color-dots",
  },
  {
    from: "index.ts",
    to: "assets/src/grid-memory",
    context: "./../assessment-grid-memory/src",
    transform(content) {
      return addBoilerplateCodeToAssessment(content, "GridMemory");
    },
  },
  {
    from: "./../assessment-grid-memory/assets/grid-memory",
    to: "assets/grid-memory",
  },
  {
    from: "index.ts",
    to: "assets/src/symbol-search",
    context: "./../assessment-symbol-search/src",
    transform(content) {
      return addBoilerplateCodeToAssessment(content, "SymbolSearch");
    },
  },
  {
    from: "./../assessment-symbol-search/assets/symbol-search",
    to: "assets/symbol-search",
  },
  {
    from: "./src/assets/tutorial",
    to: "assets/tutorial",
  },
];

// eslint-disable-next-line no-undef
module.exports = {
  module: {
    rules: [
      {
        test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
        use: { loader: "umd-compat-loader" },
      },
    ],
    // eslint-disable-next-line no-undef
    noParse: [require.resolve("@ts-morph/common/dist/typescript.js")],
  },
  plugins: [
    new CopyPlugin({
      patterns: CopyPluginPatterns,
    }),
  ],
};

const sessionCode = `const session = new Session({
  activities: [activity],
  sessionCallbacks: {
    /**
     * onSessionLifecycleChange() will be called on events such
     * as when the session initialization is complete or when the
     * session ends.
     *
     * Once initialized, the below code will start the session.
     */
    onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
      if (ev.initialized) {
        session.start();
      }
      if (ev.ended) {
        console.log("🔴 ended session");
      }
    },
  },
  activityCallbacks: {
    /**
     * onActivityDataCreate() callback is where you insert code to post data
     * to an API or interop with a native function in the host app,
     * if applicable.
     *
     * newData is the data that was just generated by the completed trial or
     * survey question.
     * data is all the data, cumulative of all trials or questions in the
     * activity, that have been generated.
     *
     * We separate out newData from data in case you want to alter the execution
     * based on the most recent trial, e.g., maybe you want to stop after
     * a certain user behavior or performance threshold in the just completed
     * trial.
     *
     * activityConfiguration is the game parameters that were used.
     *
     * The schema for all of the above are in JSON Schema format.
     * Currently, only games generate schema.
     */
    onActivityDataCreate: (ev: ActivityDataEvent) => {
      if (ev.activityType === ActivityType.game) {
        console.log(\`✅ trial complete:\`);
      } else if (ev.activityType === ActivityType.survey) {
        console.log(\`✅ question answered:\`);
      }
      console.log("  newData: " + JSON.stringify(ev.newData));
      console.log("  newData schema: " + JSON.stringify(ev.newDataSchema));
      console.log("  data: " + JSON.stringify(ev.data));
      console.log("  data schema: " + JSON.stringify(ev.dataSchema));
      console.log(
        "  activity parameters: " + JSON.stringify(ev.activityConfiguration)
      );
      console.log(
        "  activity parameters schema: " +
          JSON.stringify(ev.activityConfigurationSchema)
      );
    },
    /**
     * onActivityLifecycleChange() notifies us when an activity, such
     * as a game (assessment) or a survey, has ended or canceled.
     * Usually, however, we want to know when all the activities are done,
     * so we'll look for the session ending via onSessionLifecycleChange
     */
    onActivityLifecycleChange: (ev: ActivityLifecycleEvent) => {
      const activityType =
        ev.activityType === ActivityType.game ? "game" : "survey";
      if (ev.ended || ev.canceled) {
        const status = ev.ended ? "🔴 ended" : "🚫 canceled";
        console.log(\`\${status} activity (\${activityType}) \${ev.name}\`);
        if (session.nextActivity) {
          session.advanceToNextActivity();
        } else {
          session.end();
        }
      }
      if (ev.started) {
        console.log(\`🟢 started activity (\${activityType}) \${ev.name}\`);
      }
    },
  },
});

/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView's invocation of session.start().
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init().then(() => {
  /**
   * session.init() may take a few moments when downloading non-local or
   * non-cached resources. After session.init() completes, the below code
   * removes the loading spinner that is defined in the HTML template.
   */
  const loaderDiv = document.getElementById("m2c2kit-loader-div");
  if (loaderDiv) {
    loaderDiv.classList.remove("m2c2kit-loader");
  }
});
`;
