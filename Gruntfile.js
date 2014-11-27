/*global module:false*/
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
      all: ['index.js', 'src/**/*.js'],

      options: {
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true,
        _: true,
        console: true
      }
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
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('dev', ['sass', 'browserify:debug']);
  grunt.registerTask('jasmine-browser', ['server', 'watch']);

};
