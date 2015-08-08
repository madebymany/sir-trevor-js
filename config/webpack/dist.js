var webpack = require('webpack');
var webpackConfigMerger = require('webpack-config-merger');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = webpackConfigMerger(require('./config'), {
  output: {
    filename: 'sir-trevor.min.js'
  },
  plugins: [
    new ExtractTextPlugin("sir-trevor.min.css"),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    })
  ]

});
