import { Game } from "@m2c2kit/core";
import { Session } from "@m2c2kit/session";

export interface StaticSiteConfig {
  /** Version of this config file format. */
  configVersion: string;
  /** Output directory for the m2c2kit static website. */
  outDir: string;
  /** Assessments to be included in the static website. */
  assessments: Array<
    RegistryAssessment | ExtendedAssessment | TarballAssessment
  >;
  /** A site-wide {@link Setup} to be applied to all assessments. It will be overridden if a setup is defined by an assessment. */
  setup?: Setup;
  /** A site-wide {@link Configure} to be applied to all assessments. It will be overridden if a configure is defined by an assessment. */
  configure?: Configure;
  /** A site-wide {@link Entry} to be applied to all assessments. It will be overridden if an entry is defined by an assessment. @remarks Using this option requires a deep understanding of the internals of m2c2kit and is not recommended for most users. */
  entry?: Entry;
}

/**
 * A setup function that is run on the assessment's page before the modules
 * for the session and assessment are loaded. This can be a function or a file
 * path to a JavaScript file to be inserted.
 *
 * @remarks This can be used to run custom code or define JavaScript
 * functions that are used later in the `Configure` code. For example, if the
 * `Configure` code uses a function `myFunction()`, then the `Setup` code
 * should define that function.
 *
 * @example
 * setup: "./path/to/setup-code.js"
 */
export type Setup = ((context: PageContext) => void) | string;

/**
 * A function that completely generates the entry point JavaScript code for an
 * assessment's page. This can be a function or a file path to a JavaScript
 * file to be inserted.
 *
 * @remarks This is reserved for advanced use cases where using {@link Setup}
 * and {@link Configure} is not sufficient. The entry code will be completely
 * responsible for loading modules, creating the session and assessment
 * objects, and starting the session. Using this option requires a deep
 * understanding of the internals of m2c2kit and is not recommended for
 * most users.
 *
 * @example
 * setup: "./path/to/entry-code.js"
 */
export type Entry = ((context: PageContext) => void) | string;

/**
 * A configuration function accepting the page context, session, and
 * assessment, or a file path to a JavaScript file to be inserted.
 *
 * @remarks This function is called after the session and assessment objects
 * have been created, but before the session has started. This is typically
 * used to configure the session to send data to a server or redirect the user
 * to another page when the session ends.
 *
 * @example
 * configure: (context, session, assessment) => {
 *   console.log(`assessment ${assessment.options.name} is version ${assessment.options.version}`)
 *   session.onActivityData((ev) => {
 *     // log data to console
 *     console.log("  newData: " + JSON.stringify(ev.newData));
 *     // send data to your server
 *     fetch("https://www.example.com/upload", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *       },
 *       body: JSON.stringify(ev.newData),
 *     });
 *   });
 *   session.onEnd(() => {
 *     // redirect when the session ends
 *     window.location.href = "https://www.example.com";
 *   });
 * }
 *
 * @example
 * configure: (context, session, assessment) => {
 *   // define a custom schema for participant id variable
 *   assessment.addTrialSchema({
 *     participant_id: {
 *       type: "string",
 *       description: "ID of the participant",
 *     },
 *   });
 *
 *   // get the participant_id from the URL params
 *   // IMPORTANT: use the URL params in the context object
 *   const participant_id = context.urlParams.get("participant_id") || "None";
 *
 *   // add the participant_id to the static trial data
 *   assessment.addStaticTrialData("participant_id", participant_id);
 *   // IMPORTANT: remove the participant_id from the URL params, so it is not
 *   // processed as a game parameter
 *   context.urlParams.delete("participant_id");
 * });
 *
 * @example
 * configure: "./path/to/configure-code.js"
 */
export type Configure =
  | ((context: PageContext, session: Session, assessment: Game) => void)
  | string;

export interface PageContext {
  /** The URL search parameters of the current page. */
  urlParams: URLSearchParams;
  /** Information about the page's assessment */
  assessment: {
    /** Assessment name */
    name: string;
    /** Assessment version */
    version: string;
  };
}

export interface Assessment {
  /** Custom parameters for the assessment, e.g., `{ number_of_trials: 4, locale: "auto" }`
   * @remarks Parameters passed through the URL query string will override these parameters.
   */
  parameters?: {
    [key: string]: string | number | boolean | object | null;
  };
  /** A {@link Setup} for this assessment. If not supplied, the site-wide setup will be used, if it exists. */
  setup?: Setup;
  /** A {@link Configure} for this assessment. If not supplied, the site-wide configure will be used, if it exists. */
  configure?: Configure;
  /** An {@link Entry} for this assessment. If not supplied, the site-wide entry will be used, if it exists. @remarks Using this option requires a deep understanding of the internals of m2c2kit and is not recommended for most users. */
  entry?: Entry;
}

/**
 * A `RegistryAssessment` is an assessment that is downloaded from a package
 * registry, such as npm or GitHub.
 */
export interface RegistryAssessment extends Assessment {
  /** Name of the assessment package to download from the registry, e.g., `@m2c2kit/assessment-symbol-search` */
  name: string;
  /** Versions to download, semver format, e.g., `>=0.8.17` or `>=0.8.17 <0.9.1 || >=0.9.1` */
  versions: string;
  /** Registry URL to download from. Default is `https://registry.npmjs.org`, but it could another registry, such as `https://npm.pkg.github.com` if downloading from a GitHub registry */
  registryUrl?: string;
  /** Environment variable that holds the authorization token for the registry, if required */
  tokenEnvironmentVariable?: string;
}

/**
 * An `ExtendedAssessment` is an assessment that extends (builds upon) another
 * another assessment.
 *
 * @remarks This is useful when you want to modify an assessment from a
 * registry and give it a different name and endpoint.
 */
export interface ExtendedAssessment extends Assessment {
  /** Name for this assessment configuration that has been extended from a
   * registry package. For example, if extending `@m2c2kit/assessment-symbol-search`
   * for a project called `aging`, a reasonable name might be `aging/symbol-search`.
   * Name must follow format of `xxxxx/yyyyy`.
   * */
  name: string;
  extends: {
    /** Name of the registry package that this assessment will extend, e.g.,
     * `@m2c2kit/assessment-symbol-search` */
    name: string;
    /** Exact version of the registry package that this assessment will
     * extend, e.g., `0.8.16` */
    version: string;
  };
  /** Version number to be given to this extended assessment configuration,
   * e.g., `1.0.0` */
  version: string;
}

/**
 * An `TarballAssessment` is an assessment that comes from a package archive
 * with a `.tgz` extension, which is created by the `npm pack` command.
 *
 * @remarks It is *highly* recommended to use a `RegistryAssessment` or
 * `ExtendedAssessment`. This better ensures the reproducibility of the static
 * site. Getting assessments from a registry is a more stable and reliable
 * process because registry packages are versioned and are for the most part
 * immutable.
 */
export interface TarballAssessment extends Assessment {
  /** Path to the `.tgz` file containing the assessment */
  tarball: string;
}
