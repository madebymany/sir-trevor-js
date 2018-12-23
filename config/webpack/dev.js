var webpack = require("webpack");
var webpackConfigMerger = require("webpack-config-merger");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = webpackConfigMerger(require("./config"), {
  devtool: "source-map",
  mode: "development",
  output: {
    filename: "sir-trevor.debug.js"
  },
  plugins: [new MiniCssExtractPlugin({ filename: "sir-trevor.debug.css" })],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: true }
          },
          {
            loader: "sass-loader",
            options: { sourceMap: true, outputStyle: "uncompressed" }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      }
      //loader: ExtractTextPlugin.extract("file?name=[name].debug.[ext]")
    ]
  }
});

module.exports = config;
