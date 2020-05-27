'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var del = require('del');
var rename = require('gulp-rename');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');

var imagemin = require('gulp-imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');

var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');

var server = require('browser-sync').create();

sass.compiler = require('node-sass');

gulp.task('clean', function () {
  return del('build');
});

gulp.task('copy', function () {
  return gulp.src([
      // 'source/img/*.{jpg,png,svg}',
      'source/js/**/*.min.js',
      'source/fonts/**/*.{woff,woff2}',
    ], {
      base: 'source/'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('style', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('images', function () {
  return gulp.src('source/img/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      // imagemin.mozjpeg({quality: 85, progressive: true}),
      imageminJpegtran({progressive: true}),
      imagemin.svgo(),
    ]))
    .pipe(gulp.dest('build/img'))
});

gulp.task('webp', function () {
  return gulp.src('source/img/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'))
});

gulp.task('sprite', function () {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(rename({prefix: 'svg-'}))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(gulp.dest('build/img'))
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([include()]))
    .pipe(gulp.dest('build'));
});

gulp.task('script', function () {
  return gulp.src(['source/js/**/*.js', '!source/js/**/*.min.js'])
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'copy',
    'style',
    'script',
    'webp',
    'images',
    gulp.series(
      'sprite',
      'html',
    ),
  ),
));

gulp.task('reload', function (done) {
  server.reload();
  done();
});

gulp.task('serve', function () {
  server.init({
    server: 'build/',
    notify: false,
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('source/js/**/*.js', gulp.series('script', 'reload'));
  gulp.watch('source/*.html', gulp.series('html', 'reload'));
});
