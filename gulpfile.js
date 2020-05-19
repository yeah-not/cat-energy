"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var del = require("del");
var rename = require("gulp-rename");

var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");

var imagemin = require("gulp-imagemin");
var imageminJpegtran = require("imagemin-jpegtran");
var webp = require("gulp-webp");

var server = require("browser-sync").create();

sass.compiler = require('node-sass');

gulp.task("style", function() {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src(["source/img/**/*.{jpg,png,svg}", "!source/img/preview/**"])
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      // imagemin.mozjpeg({quality: 85, progressive: true}),
      imageminJpegtran({progressive: true}),
      imagemin.svgo(),
    ]))
    .pipe(gulp.dest("build/img"))
});

gulp.task("webp", function() {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function(){
  return gulp.src([
    // "source/img/*.{jpg,png,svg}",
    "source/fonts/**/*.{woff,woff2}",
    "source/js/**/*.js"], {
      base: "source/"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("html", function(){
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "html",
  "style",
  "images",
  "webp"
));

gulp.task("reload", function(done) {
  server.reload();
  done();
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("style"));
  gulp.watch("source/*.html", gulp.series("html", "reload"));
});
