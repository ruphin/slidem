const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const historyApiFallback = require('connect-history-api-fallback');

const SOURCE = 'src';
const source = function(...subpaths) {
  return subpaths.length == 0 ? SOURCE : path.join(SOURCE, ...subpaths);
};

// Watch files for changes & reload
gulp.task('serve', function() {
  browserSync({
    port: 5000,
    notify: false,
    open: false,
    logPrefix: 'APP',
    files: [source('*'), 'index.html'],
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: ['', 'node_modules']
    },
    middleware: [historyApiFallback()]
  });

  gulp.watch(source('*'), browserSync.reload);
  gulp.watch('index.html', browserSync.reload);
});

// TODO: Prefix and minify the inlined CSS

// Build production files, the default task
gulp.task('default', function(cb) {
  gulp
    .src(source('*.js'))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['minify'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});
