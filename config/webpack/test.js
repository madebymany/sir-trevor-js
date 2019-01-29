var webpack = require("webpack");
var webpackConfigMerger = require("webpack-config-merger");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = webpackConfigMerger(require("./config"), {
  mode: "development",
  output: {
    filename: "sir-trevor.test.js"
  },
  plugins: [new MiniCssExtractPlugin({ filename: "sir-trevor.test.css" })],
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
            options: { outputStyle: "compressed" }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "[path][name].test.[ext]" }
          }
        ]
      }
      //loader: ExtractTextPlugin.extract("file?name=[name].debug.[ext]")
    ]
  }
});
