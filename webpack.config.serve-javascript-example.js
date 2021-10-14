const path = require('path');
const { IgnorePlugin } = require('webpack');

module.exports = {
    // we use webpack only for webpack-dev-server
    // IgnorePlugin will prevent any bundling
    plugins: [
        new IgnorePlugin({
            resourceRegExp: /src|node_modules/,
        }),
    ],
    devServer: {
        static: [
            { directory: path.join(__dirname, 'examples/javascript') },
            { directory: path.join(__dirname, 'dist') }
        ],
    },
};