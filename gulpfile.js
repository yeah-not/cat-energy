'use strict';

const gulp = require('gulp');
const {series, parallel} = require('gulp');
const plumber = require('gulp-plumber');
const del = require('del');
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const gcmq = require('gulp-group-css-media-queries');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const inlineSvg = require('postcss-inline-svg');
const svgo = require('postcss-svgo');
const cleanCSS = require('gulp-clean-css');

// Functions
// ---------------
function clean() {
  return del('./build');
}

function html() {
  return gulp.src('./source/*.html')
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
}

function styles() {
  return gulp.src('./source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gcmq())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: [ "> 0.1%", "IE 11" ],
        cascade: false
      }),
      inlineSvg(),
      svgo()
    ]))
    .pipe(gulp.dest('./build/css'))
    .pipe(cleanCSS({level: 2}))
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src('source/js/*.js')
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp.src([
      './source/img/*.{jpg,png,svg}',
      './source/*.png'
    ], {
      base: './source'
    })
    .pipe(gulp.dest('./build'));
}

function sprite() {
  return gulp.src('./source/img/svg-sprite/*.svg')
    .pipe(gulp.dest('./build/img'));
}

function fonts() {
  return gulp.src('./source/fonts/*.{woff,woff2}')
    .pipe(gulp.dest('./build/fonts'));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./build/"
    }
  });

  gulp.watch('./source/*.html', html);
  gulp.watch('./source/sass/**/*.scss', styles);
  gulp.watch('./source/js/*.js', scripts);
}


// Tasks
// ---------------
gulp.task('build', series(clean,
                   parallel(html, styles, scripts, images, sprite, fonts)));
gulp.task('watch', series('build', watch));
