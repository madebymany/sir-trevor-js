var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = webpackConfigMerger(require('./config'), {
  output: {
    filename: 'sir-trevor.js'
  },
  plugins: [
    // Include so we can share config, but disable
    new ExtractTextPlugin("", { disable: true }),
  ]

});
