"use strict";

var gulp = require('gulp');
var nugetpack = require('./index');

gulp.task('package', function(callback) {
  var pkg = require('./package.json');

  nugetpack({
      id: pkg.name.replace(/-/g, ''),
      version: pkg.version,
      authors: pkg.author,
      owners: "w8r",
      description: pkg.description,
      copyright: pkg.license,
      outputDir: "./pkg/"
    },

    // [{
    //   "src": "./node_modules/gulp-util/**/*.js"
    // }],

    // [{
    //   src: "./node_modules/gulp-util/**/*.js",
    //   dest: "/Content/Client/js/gulp-util-js/"
    // }, {
    //   src: "./node_modules/grunt-nuget-pack/lib/Package.js",
    //   dest: "/Content/Client/js/pack.js"
    // }],

    [
      "./node_modules/gulp-util/**/*.js",
      "./node_modules/grunt-nuget-pack/lib/Package.js"
    ],

    callback);
});

gulp.task('test', ['package'])
