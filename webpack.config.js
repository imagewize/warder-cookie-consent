const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { version } = require('./package.json');

// Human-readable pointer to the uncompressed source, emitted at the top of the
// compiled bundle on every build (WordPress.org guideline §4). Kept in the
// webpack config so it regenerates automatically and dist/ is never hand-edited.
const sourceBanner = [
    `Warder Cookie Consent v${version}`,
    'This file is compiled from human-readable source with webpack.',
    'Source: src/index.js (shipped in this plugin) + webpack.config.js',
    'Repository: https://github.com/imagewize/warder-cookie-consent',
    'Build from source: npm install && npx webpack',
].join('\n');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'cookieconsent.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    optimization: {
        // Keep the source banner inline at the top of the bundle instead of
        // letting Terser hoist it into a separate .LICENSE.txt file, so the
        // pointer to source lives in the one compiled file reviewers open.
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: sourceBanner,
            entryOnly: true,
        }),
    ],
};