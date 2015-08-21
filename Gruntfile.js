/* global module:false */

require('es5-shim');
require('es6-shim');

module.exports = function(grunt) {

  var banner = [
    '/*!',
    ' * Sir Trevor JS v<%= pkg.version %>',
    ' *',
    ' * Released under the MIT license',
    ' * www.opensource.org/licenses/MIT',
    ' *',
    ' * <%= grunt.template.today("yyyy-mm-dd") %>',
    ' */\n\n',
  ].join("\n");

  var jsHintDefaultOptions = {
    // Errors
    bitwise: true,
    camelcase: false,
    curly: true,
    eqeqeq: true,
    forin: true,
    freeze: true,
    immed: true,
    indent: 2,
    latedef: true,
    newcap: true,
    noarg: true,
    nonbsp: true,
    nonew: true,
    strict: true,
    maxparams: 4,
    maxdepth: 3,
    maxcomplexity: 10,
    undef: true,
    unused: 'vars',

    // Relax
    eqnull: true,

    // Envs
    browser: true,
    jquery: true,
    node: true,
  }

  var webpackOptions = function(filename){
    return {
      entry: "./index.js",
      output: {
        library: "SirTrevor",
        libraryTarget: "umd",
        path: "build/",
        filename: filename
      },
      externals: {
        "jquery": {
          root: "jQuery",
          commonjs: "jquery",
          commonjs2: "jquery",
          amd: "jquery"
        }
      }
    }
  };

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    webpack: {
      dist: webpackOptions("sir-trevor.js"),

      debug: Object.assign(webpackOptions("sir-trevor.debug.js"), {
        debug: true,
      }),

      test: webpackOptions("sir-trevor.test.js")
    },

    karma: {
      test: {
        configFile: 'karma.conf.js'
      }
    },

    uglify: {
      options: {
        mangle: false,
        banner: banner
      },
      dist: {
        files: {
          'build/sir-trevor.min.js': ['build/sir-trevor.js']
        }
      },
    },

    watch: {
      scripts: {
        files: ['src/*.js', 'src/**/*.js', 'src/sass/*.scss'],
        tasks: ['dev'],
      }
    },

    jshint: {
      lib: {
        src: ['index.js', 'src/**/*.js'],
        options: Object.assign({}, jsHintDefaultOptions, {
          jquery: false,
          globals: {
            i18n: true,
            webkitURL: true,
          },
        }),
      },

      tests: {
        src: ['spec/**/*.js'],
        options: Object.assign({}, jsHintDefaultOptions, {
          globals: {
            _: true,
            SirTrevor: true,
            i18n: true,
            webkitURL: true,
            jasmine: true,
            describe: true,
            expect: true,
            it: true,
            spyOn: true,
            beforeEach: true,
            afterEach: true,
            beforeAll: true,
            afterAll: true
          },
        }),
      },
    },

    sass: {
      dist: {
        files: {
          'build/sir-trevor.css': 'src/sass/main.scss'
        }
      },
      test: {
        files: {
          'build/sir-trevor.test.css': 'src/sass/main.scss'
        },
        options: {
          sourceMap: false
        }
      },

      options: {
        sourceMap: true,
        includePaths: require('node-bourbon').includePaths,
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '127.0.0.1',
        }
      }
    },

    jasmine_nodejs: {
      options: {
        specNameSuffix: "spec.js",
        useHelpers: false,
        stopOnFailure: false,
        reporters: {
          console: {
            colors: true,
            cleanStack: 1,
            verbosity: 1,
            listStyle: "flat",
            activity: true
          }
        },
      },
      test: {
        specs: [
          "spec/e2e/*.spec.js"
        ]
      }
    }
  });

  grunt.registerTask('default', ['test', 'sass', 'webpack', 'uglify']);
  grunt.registerTask('test', ['jshint', 'karma', 'webpack:test', 'sass:test', 'connect', 'jasmine_nodejs']);
  grunt.registerTask('dev', ['sass', 'webpack:debug']);
  grunt.registerTask('jasmine-browser', ['server', 'watch']);

};
