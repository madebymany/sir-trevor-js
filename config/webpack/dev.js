var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var config = webpackConfigMerger(require('./config'), {
  debug: true,
  devtool: 'source-map',
  output: {
    filename: 'sir-trevor.debug.js'
  },
  plugins: [
    new ExtractTextPlugin("sir-trevor.debug.css")
  ]
});

config.module.preLoaders = [{
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract('css?sourceMaps!autoprefixer!sass?sourceMaps&outputStyle=uncompressed')
}];

module.exports = config;
