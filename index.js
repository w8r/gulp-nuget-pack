"use strict";

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var queue = require('queue-async');
var gutil = require('gulp-util');
var through = require('through2');
var Package = require('grunt-nuget-pack/lib/Package');

var NUGETPACK_EXT = "nupkg";

module.exports = function(options, files, taskCallback) {
  var baseDir, pack;

  if (typeof options != "object") {
    throw new gutil.PluginError({
      plugin: 'nugetpack',
      message: "Required meta information not specified."
    });
  }

  pack = new Package(options);

  if (options.baseDir) {
    baseDir = options.baseDir;
  } else {
    baseDir = process.cwd();
  }

  if (options.excludes) {
    pack.addExcludes(options.excludes);
  }

  var q = queue();

  files.forEach(function(filePair) {
    var sourceFiles = [];
    q.defer(function(queueCallback) {
      gulp.src(filePair.src || filePair)
        .pipe(through.obj(function(file, enc, sourceCallback) {
          sourceFiles.push(file.path);
          sourceCallback();
        }, function(streamCallback) {
          sourceFiles.forEach(function(src) {
            var dest = filePair.dest;
            if (!dest) {
              if (path.resolve(src)
                .indexOf(path.resolve(baseDir)) !== 0) {
                throw new gutil.PluginError({
                  plugin: 'nugetpack',
                  message: "Path for file: " + src +
                    " isn't within the baseDir: " +
                    baseDir
                });
              }
              dest = path.join("content", path.relative(baseDir, src));
            } else {
              if (dest[dest.length - 1] === '/') {
                var prefix = path.relative(baseDir, filePair.src).match(/([^\*]+)/i);
                var b = path.relative(baseDir, src);
                if (prefix) {
                  b = b.replace(prefix[0], '');
                }
                dest = path.join(dest, b);
              }
            }

            try {
              pack.addFile(src, dest);
            } catch (ex) {
              throw ex;
              queueCallback(ex);
            }
          });
          queueCallback(null, filePair.src || filePair);
          streamCallback();
        }));
    });
  });

  q.awaitAll(function(err, result) {
    var packageFilePath = options.id + "." + options.version + '.' + NUGETPACK_EXT;
    if (options.outputDir) {
      if (!fs.existsSync(options.outputDir)) fs.mkdirSync(options.outputDir);
      packageFilePath = path.join(options.outputDir, packageFilePath);
    }

    try {
      pack.saveAs(packageFilePath, taskCallback);
      gutil.log(gutil.colors.green("Created nupkg file:"), gutil.colors.white(packageFilePath));
    } catch (ex) {
      throw new gutil.PluginError({
        plugin: 'nugetpack',
        message: ex.message
      });
    }
  });
};
