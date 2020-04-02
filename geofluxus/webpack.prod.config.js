var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.base.config.js');
const Uglify = require("uglifyjs-webpack-plugin");

config.output.path = path.resolve('./geofluxus/static/bundles/prod/');
config.output.publicPath = '/static/bundles/prod/';
// no hashes in production
config.output.filename = '[name].js';

config.plugins = config.plugins.concat([
  new BundleTracker({filename: './geofluxus/webpack-stats-prod.json'}),
  new Uglify({
    compressor: {
      warnings: false
    }
  })
])

module.exports = config;