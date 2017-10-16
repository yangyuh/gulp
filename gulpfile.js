var gulp = require('gulp');
var mkdirp = require('mkdirp');
var sass = require('gulp-sass');

// 将默认的任务代码放在这
gulp.task('default', function() {
    console.log(1111)
});

// 创建项目源文件目录任务 命令行 gulp createSrcDir执行
gulp.task('createSrcDir', function() {
    createSrcDir();
});

// 编译sass
gulp.task('loadSass', function() {
    return gulp.src('src/css/**/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('dist/css'))
});
// 实时编译
gulp.watch('src/css/**/*.scss', ['loadSass']);

// 创建源文件目录
function createSrcDir() {
    var srcHtml = './src/', //页面文件源文件目录
        srcJS = './src/js/', //JS源文件目录
        srcCSS = './src/css/', //SCSS源文件目录
        srcImage = './src/img/', //图片源文件目录
        srcFont = './src/fonts/', //字体图标源文件目录
        srcComp = './src/comp/', //组件文件源文件目录
        srcLib = './src/lib/', //组件文件源文件目录
        // 生产文件目录
        destHtml = './dist/', //页面文件生产目录
        destJS = './dist/js/', //JS生产目录
        destCSS = './dist/css/', //CSS生产目录
        destFont = './dist/fonts/', //字体图标生产目录
        destImage = './dist/img/' //图片生产目录
    var dirs = [srcJS, destJS, srcCSS, destCSS, srcFont, destFont, srcImage, destImage, srcComp, srcHtml, destHtml, srcLib];
    // 生成项目结构
    dirs.forEach(dir => {
        mkdirp.sync(dir);
    });
}