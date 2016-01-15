gulp   = require 'gulp'
coffee = require 'gulp-coffee'

gulp.task 'default', () ->
  gulp.src 'coffee/*.coffee'
    .pipe coffee()
    .pipe gulp.dest('./public')
