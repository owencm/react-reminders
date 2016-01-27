const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const path = require('path');
const swPrecache = require('sw-precache');
const runSequence = require('run-sequence');
const uglify = require('gulp-uglify');

var builtDir = 'built-for-parse';
var clientBuiltDir = builtDir + '/public';
var cloudBuiltDir = builtDir + '/cloud';
var srcDir = 'src';
var cloudSrcDir = srcDir+'/cloud';
var clientSrcDir = srcDir+'/client';

gulp.task('generate-precache-service-worker', function(callback) {
  swPrecache.write(path.join(clientBuiltDir, 'service-worker.js'), {
    staticFileGlobs: [clientBuiltDir + '/**/*.{js,html,css,png,jpg,gif}'],
    stripPrefix: clientBuiltDir,
    importScripts: ['my-service-worker.js']
  }, callback);
});

gulp.task('copy-static-resources', function () {
  return gulp.src([path.join(clientSrcDir, '*.html'),
                   path.join(clientSrcDir, 'manifest.json')])
         .pipe(gulp.dest(clientBuiltDir));
});

gulp.task('build-sw', function () {
  return browserify({entries: path.join(clientSrcDir, 'service-worker.js')})
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('my-service-worker.js'))
        .pipe(gulp.dest(clientBuiltDir));
})

gulp.task('build-client-js', function () {
  return browserify({entries: path.join(clientSrcDir, 'main.js')})
        .transform(babelify, { presets: ['react','es2015'] })
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(clientBuiltDir));
});

gulp.task('build-client', function () {
  return runSequence( 'copy-static-resources',
                      'build-sw',
                      'build-client-js',
                      'generate-precache-service-worker');
});

gulp.task('build-cloud', function () {
  return browserify({entries: path.join(cloudSrcDir, 'main.js')})
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(cloudBuiltDir));
});

gulp.task('default', function () {
  return runSequence('build-client', 'build-cloud');
});

gulp.task('watch', function () {
  gulp.run('default');
  gulp.watch(path.join(cloudSrcDir, '**/*'), ['build-cloud']);
  gulp.watch(path.join(clientSrcDir, '**/*'), ['build-client']);
});
