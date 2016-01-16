gulp   = require 'gulp'
coffee = require 'gulp-coffee'

gulp.task 'coffee', () ->
  gulp.src 'coffee/*.coffee'
    .pipe coffee()
    .pipe gulp.dest('./public')

gulp.task 'watch', () ->
	gulp.watch 'coffee/*.coffee', ['coffee']

gulp.task 'default', ['coffee']

