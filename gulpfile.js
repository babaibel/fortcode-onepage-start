var gulp = require('gulp'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream;
 
gulp.task('inject', function () {
  var target = gulp.src('app/_html/index.html');
  var sources = gulp.src(['app/**/*.js', 'app/**/*.css'], {read: false});

  return target.pipe(inject(sources))
    .pipe(gulp.dest('app/_html'));

  // gulp.src('app/_html/index.html')
  // .pipe(inject(gulp.src(['app/_html/partials/head.html']), {
  //   starttag: '<!-- inject:head:{{ext}} -->',
  //   transform: function (filePath, file) {
  //     // return file contents as string 
  //     return file.contents.toString('utf8')
  //   }
  // }))
  // .pipe(gulp.dest('app/_html'));
});

gulp.task('bower', function () {
  gulp.src('app/index.html')
    .pipe(wiredep({
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(gulp.dest('app/'));
});