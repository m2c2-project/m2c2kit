/**
 * This Docusaurus plugin modifies the baseUrl that is used in the
 * iframe fetch proxy. This is needed if the Docusaurus site is not
 * being served from the root, which happens with GitHub pages.
 *
 * Static resources for m2c2kit are built into the Docusaurus site at
 * /m2c2kit. These include image/font assets and bundled js files.
 * The example and tutorial code is written as if the m2c2kit
 * resources are being served from the root, e.g., an image url is
 * listed as "assets/docs/img/blue-marble.jpg". The iframe fetch proxy
 * then fetches the image from "m2c2kit/assets/docs/img/blue-marble.jpg".
 *
 * When the docs site is not running at the root, however, the iframe
 * fetch proxy will need to fetch these assets from <BASE_URL>/m2c2kit,
 * not /m2c2kit. This plugin modifies the baseUrl that is used in the
 * iframe fetch proxy.
 *
 * This plugin goes through all the assets webpack will process and
 * replaces the string "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_"
 * with the baseUrl. If the baseUrl is not defined (docs are being
 * served from the root), then the string is replaced with an empty
 * string.
 *
 * The string "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_" is a long
 * ugly string that is unlikely to be used in the codebase.
 *
 * Originally, this plugin ran in the Docusaurus postBuild hook. This hook,
 * however, is called only in a production build. This plugin needs to run
 * for both production and development builds. The plugin now runs in the
 * webpack compilation hook.
 */

const pattern = "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_";

export default function pluginM2c2kitModifyBaseUrl(_context, options) {
  return {
    name: "plugin-m2c2kit-modify-base-url-new",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configureWebpack(config, isServer, utils, content) {
      config.plugins?.push({
        apply: (compiler) => {
          compiler.hooks.thisCompilation.tap(
            "Modify Base URL",
            (compilation) => {
              compilation.hooks.processAssets.tap(
                {
                  name: "Modify Base URL",
                  stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                () => {
                  const RawSource =
                    compilation.compiler.webpack.sources.RawSource;
                  const assets = compilation.getAssets();
                  for (const asset of assets) {
                    const sourceText = asset.source.source();
                    if (sourceText.includes(pattern)) {
                      const baseUrl =
                        options.baseUrl === undefined ||
                        options.baseUrl === null ||
                        options.baseUrl === "/"
                          ? ""
                          : options.baseUrl.replace(/^\/+|\/+$/g, "") + `/`;
                      const re = new RegExp(pattern, "g");
                      compilation.updateAsset(asset.name, function (source) {
                        return new RawSource(
                          source.source().replace(re, baseUrl),
                        );
                      });
                    }
                  }
                },
              );
            },
          );
        },
      });
    },
  };
}
