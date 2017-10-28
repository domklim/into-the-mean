module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    webdriver: {
      test: {
        configFile: './wdio.conf.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-webdriver');
}
