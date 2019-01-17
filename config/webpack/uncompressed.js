var webpack = require("webpack");
var webpackConfigMerger = require("webpack-config-merger");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = webpackConfigMerger(require("./config"), {
  mode: "production",
  optimization: {
    minimize: false
  },
  output: {
    filename: "sir-trevor.js"
  },
  plugins: [new MiniCssExtractPlugin({ filename: "sir-trevor.css" })],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {}
          },
          {
            loader: "sass-loader",
            options: { outputStyle: "uncompressed" }
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
    ]
  }
});

module.exports = config;
