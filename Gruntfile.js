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
          },
          jsbeautifier : {
                files : ['RTCMultiConnection.js', 'demos/*.html'],
                options : {
                    js: {
                      braceStyle: "collapse",
                      breakChainedMethods: false,
                      e4x: false,
                      evalCode: false,
                      indentChar: " ",
                      indentLevel: 0,
                      indentSize: 4,
                      indentWithTabs: false,
                      jslintHappy: false,
                      keepArrayIndentation: false,
                      keepFunctionIndentation: false,
                      maxPreserveNewlines: 10,
                      preserveNewlines: true,
                      spaceBeforeConditional: true,
                      spaceInParen: false,
                      unescapeStrings: false,
                      wrapLineLength: 0
                  },
                  html: {
                      braceStyle: "collapse",
                      indentChar: " ",
                      indentScripts: "keep",
                      indentSize: 4,
                      maxPreserveNewlines: 10,
                      preserveNewlines: true,
                      unformatted: ["a", "sub", "sup", "b", "i", "u"],
                      wrapLineLength: 0
                  },
                  css: {
                      indentChar: " ",
                      indentSize: 4
                  }
                }
            }
    });

    // enable plugins
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-htmlhint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['jsbeautifier', 'htmlhint', 'jshint', 'uglify']);
};
