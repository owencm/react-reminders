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

gulp.task('generate-precache-service-worker', function(callback) {
  var rootDir = 'build';

  swPrecache.write(path.join(rootDir, 'service-worker.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('copy-static-resources', function () {
  return gulp.src(['src/*.html', 'src/manifest.json']).pipe(gulp.dest('build'));
});

gulp.task('build-sw', function () {
  return browserify({entries: 'src/service-worker.js'})
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('my-service-worker.js'))
        .pipe(gulp.dest('build'));
})

gulp.task('build-app', function () {
  return browserify({entries: 'src/main.js'})
        .transform(babelify, { presets: ['react','es2015'] })
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('default', function () {
  return runSequence('copy-static-resources', 'build-sw', 'build-app', 'generate-precache-service-worker');
});

gulp.task('watch', function() {
  gulp.run('default');
  gulp.watch('src/**/*', ['default']);
});
