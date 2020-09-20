const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
// const debug = require('gulp-debug');
const sourceMaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const spritesmith = require('gulp.spritesmith');
// const rimraf = require('rimraf');
const rename = require('gulp-rename');


//  Если режим сборки development, то тогда подключаем sourcemaps
const isDev = true;


/* --------------- Styles compile --------------- */
gulp.task('sass', function () {
    // указываем путь к файлу
    // /**/* любая вложенность и любые файлы
    // *.{css, scss} файлы с задаными расширениями

    // {read: false} не нужно читать содержимое файлов
    // сокращает время работи, например, с картинками
    // return gulp.src('app/scss/**/*.scss', {read: false})

    return gulp.src('app/scss/**/*.scss')
        // // debug() что бы знать детально что происходит в процесе сборки
        // // добавляем после каждого действия
        // .pipe(gulpIf(isDev, debug({title: 'src'})))

        // если в файле scss напишем некоректный код
        // модуль позаботится чтобы скрипт не отключался, а работал далее
        .pipe(plumber())

        // // инициализируем sourceMaps
        // .pipe(sourceMaps.init())

        // инициализируем sourceMaps
        // если нужно влезть в поток и проверить нужно ли добавлять соурсмапы или нет
        .pipe(gulpIf(isDev, sourceMaps.init()))

        // компилируем scss код
        .pipe(sass())

        // добавляем автопрефиксы
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))

        // компилируем scss код в один css файл
        .pipe(concat('main.css'))

        // удаляет лишние пробелы
        .pipe(cleanCss())

        // // закрываем sourceMaps
        // .pipe(sourceMaps.write())

        // закрываем sourceMaps
        // если нужно влезть в поток и проверить нужно ли добавлять соурсмапы или нет
        .pipe(gulpIf(isDev, sourceMaps.write()))

        .pipe(rename('main.min.css'))

        // путь куда будет добавляться компилированый код
        .pipe(gulp.dest('build/css'))

        // перезапускаем браузер
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream: true}));
});

/* --------------- Copy js --------------- */
gulp.task('js', function () {
    return gulp.src('app/js/*.js')
        .pipe(gulp.dest('build/js'))
        .pipe(uglify())
        .pipe(browserSync.reload({stream: true}));
});

/* --------------- Copy img --------------- */
gulp.task('img', function () {
    return gulp.src('app/img/**/*.{png,jpg}')
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({stream: true}));
});

/* --------------- Copy fonts --------------- */
gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest('build/fonts'))
        .pipe(browserSync.reload({stream: true}));
});

/* --------------- Sprite --------------- */
gulp.task('sprite', function (cb) {
    const spriteData = gulp.src('app/img/icons/*.png')
        .pipe(spritesmith({
            imgName : 'sprite.png',
            imgPath : '../img/sprite/sprite.png',
            cssName : 'sprite.scss'
        }));

    spriteData.img
        .pipe(gulp.dest('build/img/sprite'))

    spriteData.css
        .pipe(gulp.dest('app/scss/global'))
    cb()
});

/* --------------- Delete --------------- */
// gulp.task('clean', function (cb) {
//     return rimraf('build', cb);
// });

/* --------------- Server --------------- */
gulp.task('serve', function () {
    // инициализируем browserSync который будет следить за изменениями папки build
    // browserSync создает собственный сервер
    // build откуда запускать сервер
    browserSync.init({
        server: "build"
    });

    // при запуске serve запускается watch
    // следим за файлами * в папке ** и если там происходят изменения запускаем таск с его именем
    gulp.watch("app/scss/**/*.scss", gulp.parallel("sass"));
    gulp.watch("app/*.html", gulp.parallel("html"));
    gulp.watch("app/js/*.js", gulp.parallel("js"));
    gulp.watch("app/img/*.{png,jpg}", gulp.parallel("img"));
    gulp.watch("app/fonts/**/*.{eot,svg,ttf,woff,woff2}", gulp.parallel("fonts"));
});

// ##############################################################
gulp.task('default', gulp.parallel('serve', 'sass', 'html', 'js', 'img', 'fonts'));
// parallel() выполняет команды паралельно/одновременно
// series() выполняет команды последовательно
