var webpack = require("webpack");

module.exports = {
  entry: "./index.js",
  output: {
    library: "SirTrevor",
    libraryTarget: "umd",
    path: "./build"
  },
  externals: {
    jquery: {
      root: "jQuery",
      commonjs: "jquery",
      commonjs2: "jquery",
      amd: "jquery"
    }
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: []
};
