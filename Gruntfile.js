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
    maxcomplexity: 13, // this is quite complex, would be good to reduce
    undef: true,
    unused: 'vars',

    // Relax
    eqnull: true,

    // Envs
    browser: true,
    jquery: true,
    node: true,
  }

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        src: 'index.js',
        dest: 'sir-trevor.js',
      },
      debug: {
        src: 'index.js',
        dest: 'sir-trevor.debug.js',
        options: {
          browserifyOptions: {
            standalone: 'SirTrevor',
            debug: true,
          },
        },
      },
      options: {
        banner: banner,
        browserifyOptions: {
          standalone: 'SirTrevor',
        },
      },
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
          'sir-trevor.min.js': ['sir-trevor.js']
        }
      }
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
        options: Object.assign({
          globals: {
            i18n: true,
            webkitURL: true,
          },
        }, jsHintDefaultOptions),
      },

      tests: {
        src: ['spec/**/*.js'],
        options: Object.assign({
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
          },
        }, jsHintDefaultOptions),
      },
    },

    sass: {
      dist: {
        files: {
          'sir-trevor.css': 'src/sass/main.scss'
        }
      }
    }

  });

  grunt.registerTask('default', ['test', 'sass', 'browserify', 'uglify']);
  grunt.registerTask('test', ['jshint', 'karma']);
  grunt.registerTask('dev', ['sass', 'browserify:debug']);
  grunt.registerTask('jasmine-browser', ['server', 'watch']);

};
