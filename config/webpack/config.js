var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: "./index.js",
  output: {
    library: "SirTrevor",
    libraryTarget: "umd",
    path: './build'
  },
  externals: {
    "jquery": {
      root: "jQuery",
      commonjs: "jquery",
      commonjs2: "jquery",
      amd: "jquery"
    }
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel?optional[]=runtime'
    },
    {
      test: /\.svg$/,
      loader: ExtractTextPlugin.extract("file?name=[path][name].[ext]")
    }],
    preLoaders: [{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!autoprefixer!sass?outputStyle=compressed')
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin()
  ]
};
