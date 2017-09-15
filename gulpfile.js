var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  wiredep = require('wiredep').stream,
  autoprefixer = require('gulp-autoprefixer'),
  inject = require('gulp-inject'),
	gutil = require('gulp-util'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2');

gulp.task('iconfont', function(){
	gutil.log('Creating svg-font');

	var fontName = 'iconic';

	return gulp.src(['app/fonts/svg/*.svg'])
		.pipe(iconfontCss({
			fontName: fontName,
			// При использовании файла формата SASS у шрифта возникали некоторые проблемы отображения
			path: 'app/styles/components/svg-fonts/iconfont-template.scss',
			targetPath: '../styles/components/svg-fonts/_iconfont.scss',
			fontPath: '../fonts/',
			cssClass: 'iconic'
		}))
		.pipe(iconfont({
			fontName: fontName,
			formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
			prependUnicode: true,
			normalize: true,
			fontHeight: 1001,
			centerHorizontally: true
		})).pipe(
			gulp.dest('app/fonts')
		);
});

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

gulp.task('ttf2woff', function(){
	gutil.log('Creating woff font');
	return gulp.src(['app/fonts/text/*.ttf'])
		.pipe(ttf2woff({
			clone: true
		}))
		.pipe(gulp.dest('app/fonts/'));
});

gulp.task('textfont', ['ttf2woff'], function(){
	gutil.log('Creating woff2 font');
	return gulp.src(['app/fonts/text/*.ttf'])
		.pipe(ttf2woff2())
		.pipe(gulp.dest('app/fonts/'));
});

// gulp.task('textfont', ['ttf2woff', 'ttf2woff2'], function(){
// 	gutil.log('Creating text-font');
// });

gulp.task('fontgen', function() {
	return gulp.src("app/fonts/text/*.{ttf,otf}")
		.pipe(fontgen({
			dest: "app/fonts"
		}));
});

gulp.task('fontfacegen', function() {
	return gulp.src("app/fonts/text/*.{ttf,otf}")
		.pipe(fontgen(result));
});

gulp.task('font', function() {
	return src('app/fonts/text/*.{ttf,otf}', { read: false })
		.pipe(gulpFont({
			ext: '.css',
			fontface: 'app/fonts',
			relative: '/app/fonts',
			dest: 'app/fonts',
			embed: ['woff'],
			collate: false
		}))
		.pipe(dest('app/fonts'));
});



gulp.task('bower', function () {
  return gulp.src('app/index.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app/'));
});


gulp.task('sass', function(){ // Создаем таск Sass
	gutil.log('Compile sass to css');
  return gulp.src('app/styles/**/*.sass') // Берем источник
    .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-styles
    .pipe(autoprefixer({ cascade: false })) // Создаем префиксы
    .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
  browserSync({ // Выполняем browserSync
    server: { // Определяем параметры сервера
      baseDir: 'app' // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task('scripts', function() {
  return gulp.src([ // Берем все необходимые библиотеки
    'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
    'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
    ])
    .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['sass'], function() {
  return gulp.src('app/css/libs.css') // Выбираем файл для минификации
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
    .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
  gulp.watch('app/styles/**/*.sass', ['sass']); // Наблюдение за styles файлами в папке styles
  gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
  return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*') // Берем все изображения из app
    .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {

  var buildCss = gulp.src([ // Переносим библиотеки в продакшен
    'app/css/main.css',
    'app/css/libs.min.css'
    ])
  .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
  .pipe(gulp.dest('dist/fonts'))

  var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
  .pipe(gulp.dest('dist/js'))

  var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
  .pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
  return cache.clearAll();
})

gulp.task('default', ['watch']);

function log(msg) {
	if (typeof(msg) === 'object') {
		for (var item in msg) {
			if (msg.hasOwnProperty(item)) {
				$.util.log($.util.colors.blue(msg[item]));
			}
		}
	} else {
		$.util.log($.util.colors.blue(msg));
	}
}
