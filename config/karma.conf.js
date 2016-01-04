// Karma configuration
//

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../spec/',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'javascripts/**/*.js',
      { pattern: 'src/sir-trevor-icons.svg', included: false, served: true, watched: false, nocache: true }
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // web server port
    port: 9876,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_ERROR,
    // logLevel: config.LOG_INFO,
    logLevel: config.LOG_ERROR,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    browserNoActivityTimeout: 60000,

    preprocessors: {
      // add webpack as preprocessor
      "javascripts/**/*.js": ['webpack'],
    },

    webpack: {
      module: {
        loaders: [{
          test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel?optional[]=runtime'
        }],
        preLoaders: [{
          test: /\.scss$/,
          loader: 'css!autoprefixer!sass?outputStyle=compressed'
        }],
        loaders: [
          { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel?stage=0&optional=runtime' },
          { test: /\.svg$/, loader: 'file' }
        ]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },
  });
}
