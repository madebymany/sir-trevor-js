var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = webpackConfigMerger(require('./config'), {
  debug: true,
  devtool: 'source-map',
  output: {
    filename: 'sir-trevor.debug.js'
  },
  plugins: [
    new ExtractTextPlugin("sir-trevor.debug.css")
  ],
  module: {
    preLoaders: [{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('autoprefixer!sass?sourceMap&outputStyle=compressed')
    }]
  }
});
