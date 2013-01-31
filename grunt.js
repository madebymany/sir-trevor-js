/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  
  grunt.initConfig({
    
    meta: {
      version: '0.2.2',
      banner: '// Sir Trevor, v<%= meta.version %>\n// made with love by Made by Many'
    },

    lint: {
      files: ['src/sir-trevor.js']
    },

    'jasmine' : {
      src : ['public/javascripts/*.js', 'dist/sir-trevor.js'],
      specs : 'spec/**/*.spec.js',
      helpers : 'spec/helpers/*.js',
      timeout : 10000,
      phantomjs : {
        'ignore-ssl-errors' : true
      }
    },
    'jasmine-server' : {
      browser : false
    },

    rig: {
      build: {
        src: ['<banner:meta.banner>', 'src/sir-trevor.js'],
        dest: 'dist/sir-trevor.js'
      }
    },

    min: {
      standard: {
        src: ['<banner:meta.banner>', '<config:rig.build.dest>'],
        dest: 'dist/sir-trevor.min.js'
      }
    },
    
    watch: {
      files: ['src/*.js', 'src/**/*.js'],
      tasks: 'default'
    },

    jshint: {
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
    uglify: {}
  });

  // Default task.
  grunt.loadNpmTasks('grunt-jasmine-runner');

  grunt.registerTask('travis', 'lint rig jasmine');

  grunt.registerTask('default', 'lint rig min');

};