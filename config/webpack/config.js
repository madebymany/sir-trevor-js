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
        exclude: function(modulePath) {
          return /node_modules/.test(modulePath) &&
            !/node_modules\/micromodal/.test(modulePath);
        },
        loader: "babel-loader",
        options: {
          "presets": ["@babel/preset-env"]
        }
      }
    ]
  },
  plugins: []
};
