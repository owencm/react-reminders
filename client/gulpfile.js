const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

gulp.task('default', function () {
  gulp.src(['src/*.html', 'src/manifest.json']).pipe(gulp.dest('build'));

  // Build service worker
  browserify({entries: 'src/service-worker.js'})
    .transform(babelify, { presets: ['es2015'] })
    .bundle()
    .pipe(source('my-service-worker.js'))
    .pipe(gulp.dest('build'));

  // Build main app
  browserify({entries: 'src/main.js'})
    .transform(babelify, { presets: ['react','es2015'] })
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
 gulp.watch('src/**/*', ['default']);
});
