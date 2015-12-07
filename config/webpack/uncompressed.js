var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var config = webpackConfigMerger(require('./config'), {
  output: {
    filename: 'sir-trevor.js'
  },
  plugins: [
    // Include so we can share config, but disable
    new ExtractTextPlugin("sir-trevor.css"),
  ]
});

config.module.preLoaders = [{
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract('css!autoprefixer!sass?outputStyle=uncompressed')
}];

module.exports = config;
