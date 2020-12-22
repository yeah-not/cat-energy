'use strict';

const {src, dest, series, parallel, watch} = require('gulp');
const plumber = require('gulp-plumber');
const del = require('del');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const ghpages = require('gh-pages');
const gulpif = require('gulp-if');

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

const isDev = (process.argv.indexOf('--dev') !== -1);

// Functions
// ---------------
function clean() {
  return del('build');
}

function styles() {
  return src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: [ '> 0.1%', 'IE 11' ],
        cascade: false
      }),
      sortmq({
        sort: 'mobile-first' // default
      }),
      inlineSvg(),
      svgo()
    ]))
    .pipe(gulpif(isDev, dest('build/css')))
    .pipe(cleanCSS({level: 2}))
    .pipe(rename('style.min.css'))
    .pipe(gulpif(isDev, sourcemaps.write()))
    .pipe(dest('build/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(['source/js/**/*.js', '!source/js/**/*.min.js'])
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(terser())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(isDev, sourcemaps.write()))
    .pipe(src('source/js/*.min.js'))
    .pipe(dest('build/js'))
    .pipe(browserSync.stream());
}

function images() {
  return src([
      'source/img/*.{jpg,png,svg}',
      'source/*.png'
    ], {
      base: 'source'
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
    .pipe(dest('build'));
}

function webp() {
  return src('source/img/*.{jpg,png}')
    .pipe(gwebp({quality: 90}))
    .pipe(dest('build/img'))
}

function fonts() {
  return src('source/fonts/*.{woff,woff2}')
    .pipe(dest('build/fonts'));
}

function sprite() {
  return src('source/img/svg-sprite/*.svg')
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(rename({prefix: 'svg-'}))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img'));
}

function html() {
  return src('source/*.html')
    .pipe(posthtml([include()]))
    .pipe(dest('build'))
    .pipe(browserSync.stream());
}

function server() {
  browserSync.init({
    server: {
      baseDir: 'build'
    }
  });

  watch('source/*.html', html);
  watch('source/sass/**/*.scss', styles);
  watch('source/js/*.js', scripts);
}

function deploy(done) {
  if (!isDev) {
    console.log('Deploying...');
    ghpages.publish('build');
  } else {
    console.log('Not available in dev build');
  }
  done();
}

// Tasks
// ---------------
let build = series(clean,
              parallel(styles, scripts, images, webp, fonts,
                series(sprite, html)
            ));

exports.build = series(build, deploy);
exports.watch = server;
