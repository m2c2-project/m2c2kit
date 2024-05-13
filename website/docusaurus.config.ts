import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

/**
 * Ensure baseURL ends with a slash and starts with a slash.
 * Do this by removing all leading and trailing slashes,
 * and then adding slashes. An empty baseUrl should be a
 * single slash, according to the Docusaurus docs.
 *
 * DOCS_BASE_URL must be defined in the GitHub Action.
 *
 * See the plugin \src\plugins\plugin-m2c2kit-modify-base-url.js
 * for full explanation.
 */
const baseUrl =
  process.env.DOCS_BASE_URL === undefined || process.env.DOCS_BASE_URL === null
    ? "/"
    : "/" + process.env.DOCS_BASE_URL.replace(/^\/+|\/+$/g, "") + `/`;

const url =
  process.env.GITHUB_REPOSITORY_OWNER === undefined ||
  process.env.GITHUB_REPOSITORY_OWNER === null
    ? "https://m2c2-project.github.io"
    : "https://" + process.env.GITHUB_REPOSITORY_OWNER + `.github.io`;

const config: Config = {
  title: "m2c2kit",
  tagline: "a library for cross-platform cognitive assessments",
  url: url,
  baseUrl: baseUrl,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "m2c2-project", // Usually your GitHub org/user name.
  projectName: "m2c2kit", // Usually your repo name.

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    "docusaurus-json-schema-plugin",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        indexBlog: false,
        highlightSearchTermsOnTargetPage: false,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "m2c2kit",
      logo: {
        alt: "m2c2kit Site Logo",
        src: "img/m2c2.svg",
      },
      items: [
        { to: "playground", label: "Playground", position: "right" },
        {
          href: "https://github.com/m2c2-project/m2c2kit",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          label: "Introduction",
          to: "/docs/intro",
        },
        {
          label: "Examples",
          to: "/docs/category/examples",
        },
        {
          label: "Getting Started",
          to: "/docs/getting-started",
        },
        {
          label: "Tutorials",
          to: "/docs/category/tutorials",
        },
        {
          label: "Reference",
          to: "/docs/category/api-reference",
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} m2c2kit. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  /**
   * When using format `detect`, any markdown files using JSX must have
   * extension `.mdx`.
   * See https://github.com/typedoc2md/typedoc-plugin-markdown/issues/609#issuecomment-2099477248
   */
  markdown: {
    format: "detect",
  },

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        id: "api-core",
        entryPoints: ["../packages/core/src/index.ts"],
        tsconfig: "../packages/core/tsconfig.json",
        out: "docs/reference/api-core",
        sidebar: {
          categoryLabel: "@m2c2kit/core",
          position: 0,
          fullNames: true,
        },
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        id: "api-addons",
        entryPoints: ["../packages/addons/src/index.ts"],
        tsconfig: "../packages/addons/tsconfig.json",
        out: "docs/reference/api-addons",
        sidebar: {
          categoryLabel: "@m2c2kit/addons",
          position: 1,
          fullNames: true,
        },
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        id: "api-session",
        entryPoints: ["../packages/session/src/index.ts"],
        tsconfig: "../packages/session/tsconfig.json",
        out: "docs/reference/api-session",
        sidebar: {
          categoryLabel: "@m2c2kit/session",
          position: 2,
          fullNames: true,
        },
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        id: "api-physics",
        entryPoints: ["../packages/physics/src/index.ts"],
        tsconfig: "../packages/physics/tsconfig.json",
        out: "docs/reference/api-physics",
        sidebar: {
          categoryLabel: "@m2c2kit/physics",
          position: 3,
          fullNames: true,
        },
      },
    ],
    [
      "./src/plugins/plugin-m2c2kit-modify-base-url.js",
      {
        baseUrl: baseUrl,
      },
    ],
    [
      "./src/plugins/plugin-m2c2kit-copy-assets.js",
      {
        folders: [
          {
            source: "../packages/core/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/core/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/addons/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/addons/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/session/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/session/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/physics/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/physics/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/survey/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/survey/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/db/dist",
            destination: "static/m2c2kit/modules/@m2c2kit/db/dist",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/core/assets",
            destination: "static/m2c2kit/modules/@m2c2kit/core/assets",
          },
          {
            source: "../node_modules/canvaskit-wasm/types",
            destination: "static/m2c2kit/modules/canvaskit-wasm/dist",
            extensions: [".d.ts"],
          },
          {
            source: "../node_modules/@webgpu/types/dist",
            destination: "static/m2c2kit/modules/webgpu/dist",
            extensions: [".d.ts"],
          },
          /**
           * If the user has an older browser, it may not support import maps.
           * The following is a polyfill for import maps.
           */
          {
            source: "../node_modules/es-module-shims/dist",
            destination: "static/m2c2kit/modules/es-module-shims/dist",
            extensions: [".js"],
          },
          {
            source: "../packages/assessment-symbol-search/dist",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-symbol-search/dist",
          },
          {
            source: "../packages/assessment-symbol-search/assets",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-symbol-search/assets",
          },
          {
            source: "../packages/assessment-color-dots/dist",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-color-dots/dist",
          },
          {
            source: "../packages/assessment-color-dots/assets",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-color-dots/assets",
          },
          {
            source: "../packages/assessment-color-shapes/dist",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-color-shapes/dist",
          },
          {
            source: "../packages/assessment-color-shapes/assets",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-color-shapes/assets",
          },
          {
            source: "../packages/assessment-grid-memory/dist",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-grid-memory/dist",
          },
          {
            source: "../packages/assessment-grid-memory/assets",
            destination:
              "static/m2c2kit/modules/@m2c2kit/assessment-grid-memory/assets",
          },
        ],
      },
    ],
  ],
};

export default config;
