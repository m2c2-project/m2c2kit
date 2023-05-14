// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const lightCodeTheme = require("prism-react-renderer/themes/github");
// eslint-disable-next-line no-undef
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
// eslint-disable-next-line no-undef
const process = require("process");

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

/** @type {import('@docusaurus/types').Config} */
const config = {
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

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // eslint-disable-next-line no-undef
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        // },
        theme: {
          // eslint-disable-next-line no-undef
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themes: [
    [
      // eslint-disable-next-line no-undef
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

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          autoCollapseCategories: true,
          hideable: true,
        },
      },
      navbar: {
        title: "m2c2kit",
        logo: {
          alt: "m2c2kit Site Logo",
          src: "img/m2c2.svg",
        },
        items: [
          { to: "playground", label: "Playground", position: "right" },
          // {
          //   type: "doc",
          //   docId: "intro",
          //   position: "left",
          //   label: "Tutorial",
          // },
          //{ to: "/blog", label: "Blog", position: "left" },
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
          //{
          // title: "Docs",
          // items: [
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
            label: "Tutorial",
            to: "/docs/tutorial-fundamentals/fundamentals",
          },
          {
            label: "Reference",
            to: "/docs/category/api-reference",
          },
          //],
          //},
          // {
          //   title: "Community",
          //   items: [
          //     {
          //       label: "Stack Overflow",
          //       href: "https://stackoverflow.com/questions/tagged/docusaurus",
          //     },
          //     {
          //       label: "Discord",
          //       href: "https://discordapp.com/invite/docusaurus",
          //     },
          //     {
          //       label: "Twitter",
          //       href: "https://twitter.com/docusaurus",
          //     },
          //   ],
          // },
          //   {
          //     title: "More",
          //     items: [
          //       {
          //         label: "Blog",
          //         to: "/blog",
          //       },
          //       {
          //         label: "GitHub",
          //         href: "https://github.com/facebook/docusaurus",
          //       },
          //     ],
          //   },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} m2c2kit. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        id: "api-core",
        entryPoints: ["../packages/core/src/index.ts"],
        tsconfig: "../packages/core/tsconfig.json",
        out: "reference/api-core",
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
        out: "reference/api-addons",
        sidebar: {
          categoryLabel: "@m2c2kit/addons",
          position: 1,
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
            source: "../packages/core/build-nobundler",
            destination: "static/m2c2kit/lib",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/addons/build-nobundler",
            destination: "static/m2c2kit/lib",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/survey/build-nobundler",
            destination: "static/m2c2kit/lib",
            extensions: [".js", ".ts"],
          },
          {
            source: "../packages/core/assets",
            destination: "static/m2c2kit/assets",
          },
          {
            source: "../packages/core/dist",
            destination: "static/m2c2kit/declarations/m2c2kit/core",
            extensions: [".d.ts"],
          },
          {
            source: "../packages/addons/dist",
            destination: "static/m2c2kit/declarations/m2c2kit/addons",
            extensions: [".d.ts"],
          },
          {
            source: "../packages/survey/dist",
            destination: "static/m2c2kit/declarations/m2c2kit/survey",
            extensions: [".d.ts"],
          },
          {
            source: "../node_modules/canvaskit-wasm/types",
            destination: "static/m2c2kit/declarations/canvaskit-wasm",
            extensions: [".d.ts"],
          },
          {
            source: "../node_modules/@webgpu/types/dist",
            destination: "static/m2c2kit/declarations/webgpu",
            extensions: [".d.ts"],
          },
          {
            source: "../packages/assessment-symbol-search/build-nobundler",
            destination: "static/m2c2kit/lib",
          },
          {
            source: "../packages/assessment-symbol-search/assets",
            destination: "static/m2c2kit/assets/symbol-search",
          },
          {
            source: "../packages/assessment-color-dots/build-nobundler",
            destination: "static/m2c2kit/lib",
          },
          {
            source: "../packages/assessment-color-dots/assets",
            destination: "static/m2c2kit/assets/color-dots",
          },
          {
            source: "../packages/assessment-color-shapes/build-nobundler",
            destination: "static/m2c2kit/lib",
          },
          {
            source: "../packages/assessment-color-shapes/assets",
            destination: "static/m2c2kit/assets/color-shapes",
          },
          {
            source: "../packages/assessment-grid-memory/build-nobundler",
            destination: "static/m2c2kit/lib",
          },
          {
            source: "../packages/assessment-grid-memory/assets",
            destination: "static/m2c2kit/assets/grid-memory",
          },
        ],
      },
    ],
  ],
};

// eslint-disable-next-line no-undef
module.exports = config;
