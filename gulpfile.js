const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

gulp.task('default', function () {
  browserify({entries: 'src/main.js'})
    .transform(babelify, { presets: ['react','es2015'] })
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('build'));
  return gulp.src('src/*.html').pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
 gulp.watch('src/**/*', ['default']);
});
