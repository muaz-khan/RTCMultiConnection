'use strict';

module.exports = function(grunt) {
    // configure project
    grunt.initConfig({
        // make node configurations available
        pkg: grunt.file.readJSON('package.json'),
        htmlhint: {
            html1: {
                src: [
                    'demos/*.html'
                ],
                options: {
                  'tag-pair': true
                }
            }
        },
        jshint: {
            options: {
                ignores: [],
                // use default .jshintrc files
                jshintrc: true
            },
            files: ['RTCMultiConnection.js']
        },
        uglify: {
            options: {
              mangle: false
            },
            my_target: {
              files: {
                'RTCMultiConnection.min.js': ['RTCMultiConnection.js']
              }
            }
          }
    });

    // enable plugins
    grunt.loadNpmTasks('grunt-htmlhint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['htmlhint', 'jshint', 'uglify']);
};
