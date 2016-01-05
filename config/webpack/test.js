var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = webpackConfigMerger(require('./config'), {
  debug: true,
  output: {
    filename: 'sir-trevor.test.js'
  },
  plugins: [
    new ExtractTextPlugin("sir-trevor.test.css")
  ],
  module: {
    loaders: [{
      test: /\.svg$/,
      loader: ExtractTextPlugin.extract("file?name=[name].test.[ext]")
    }]
  }
});
