/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  
  grunt.initConfig({
    
    meta: {
      version: '0.0.1',
      banner: '// Sir Trevor, v<%= meta.version %>\n'
    },

    lint: {
      files: ['src/sir-trevor.js']
    },

    rig: {
      build: {
        src: ['<banner:meta.banner>', 'src/sir-trevor.js'],
        dest: 'lib/sir-trevor.js'
      }
    },

    min: {
      standard: {
        src: ['<banner:meta.banner>', '<config:rig.build.dest>'],
        dest: 'lib/sir-trevor.min.js'
      }
    },
    
    watch: {
      files: 'src/*',
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
  grunt.registerTask('default', 'lint rig min');

};