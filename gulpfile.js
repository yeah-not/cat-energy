"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

var del = require("del");
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
    .pipe(server.stream());
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function(){
  return gulp.src([
    "source/img/*.{jpg,png,svg}",
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
  "style"
));











gulp.task("serve", gulp.series("style", function() {
  server.init({
    server: "source/",
    notify: false,
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("style"));
  gulp.watch("source/*.html").on("change", server.reload);
}));
