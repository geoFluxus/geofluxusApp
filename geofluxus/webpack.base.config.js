var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var entryPoints = {
    Welcome:   './js/welcome'
};

module.exports = {
    context: __dirname,

    entry: entryPoints,

    output: {
        path: path.resolve('./geofluxus/static/bundles/local/'),
        publicPath: '/static/bundles/local/',
        filename: '[name]-[hash].js'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
            minChunks: function (module, count) {
                // workaround: webpack has problems bundling css files shared between entry points,
                // it is always missing  at one entry point then (which one seems random)
                // -> bundle all required css files into commons.css
                if(module.resource && (/^.*\.(css|scss|less)$/).test(module.resource)) {
                    return true;
                }
                // bundle node modules that are shared at least in between two different entry points
                return module.context && module.context.includes('node_modules') && count === 2;
            }
        }),
        new ExtractTextPlugin('[name]-[hash].css', {
            allChunks: true
        }),
    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
}