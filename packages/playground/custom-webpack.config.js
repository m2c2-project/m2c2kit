module.exports = {
  module: {
    rules: [
      {
        test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
        use: { loader: "umd-compat-loader" },
      },
    ],
    noParse: [require.resolve("@ts-morph/common/dist/typescript.js")],
  },
};
