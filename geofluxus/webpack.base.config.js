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

    plugins: [],

    optimization: {
        splitChunks: {
            name: 'commons',
            minChunks: 1
        }
    }
}