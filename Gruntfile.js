/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.initConfig({

    'jasmine' : {
      'sir-trevor': {
        src : 'dist/sir-trevor.js',
        options: {
          vendor: 'public/javascripts/*.js',
          specs : 'spec/**/*.spec.js',
          helpers : 'spec/helpers/*.js'
        }
      }
    },

    rig: {
      build: {
        src: ['<banner:meta.banner>', 'src/sir-trevor.js'],
        dest: 'dist/sir-trevor.js'
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      standard: {
        files: {
          'dist/sir-trevor.min.js': ['<banner:meta.banner>', 'dist/sir-trevor.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/*.js', 'src/**/*.js', 'src/sass/*.scss'],
        tasks: ['sass', 'rig']
      }
    },

    jshint: {
      all: ['dist/sir-trevor.js'],

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
          'dist/sir-trevor.css': 'src/sass/main.scss'
        }
      }
    }

  });

  // Default task.
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('travis', ['rig', 'jasmine']);

  grunt.registerTask('default', ['sass', 'rig', 'uglify', 'jasmine']);

  grunt.registerTask('jasmine-browser', ['server','watch']);

};
