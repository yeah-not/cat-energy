'use strict';

const gulp = require('gulp');
const {series, parallel} = require('gulp');
const plumber = require('gulp-plumber');
const del = require('del');
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const ghpages = require('gh-pages');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sortmq = require('postcss-sort-media-queries')
const inlineSvg = require('postcss-inline-svg');
const svgo = require('postcss-svgo');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');

const imagemin = require('gulp-imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const gwebp = require('gulp-webp');
const svgstore = require('gulp-svgstore');

const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');

// Functions
// ---------------
function clean() {
  return del('./build');
}

function styles() {
  return gulp.src('./source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: [ "> 0.1%", "IE 11" ],
        cascade: false
      }),
      sortmq({
        sort: 'mobile-first' // default
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
  return gulp.src(['source/js/**/*.js', '!source/js/**/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.src('source/js/*.min.js'))
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
    .pipe(imagemin([
      // imagemin.optipng({optimizationLevel: 3}),
      // imagemin.mozjpeg({quality: 85, progressive: true}),
      imageminPngquant({quality: [0.7, 1]}),
      imageminJpegtran({progressive: true}),
      imagemin.svgo()
    ],{
      // verbose: true
    }))
    .pipe(gulp.dest('./build'));
}

function webp() {
  return gulp.src('./source/img/*.{jpg,png}')
    .pipe(gwebp({quality: 90}))
    .pipe(gulp.dest('./build/img'))
}

function fonts() {
  return gulp.src('./source/fonts/*.{woff,woff2}')
    .pipe(gulp.dest('./build/fonts'));
}

function sprite() {
  return gulp.src('./source/img/svg-sprite/*.svg')
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(rename({prefix: 'svg-'}))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('./build/img'));
}

function html() {
  return gulp.src('./source/*.html')
    .pipe(posthtml([include()]))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
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

function deploy(done) {
  ghpages.publish('build');
  done();
}


// Tasks
// ---------------
gulp.task('build',
  series(clean,
    parallel(styles, scripts, images, webp, fonts,
      series(sprite, html)
)));
gulp.task('watch', series('build', watch));
gulp.task('deploy', deploy);
