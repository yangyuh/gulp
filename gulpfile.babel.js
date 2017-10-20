import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
var fileinclude = require('gulp-file-include');
const plugins = gulpLoadPlugins();
const reload = browserSync.reload;

// ejs模板引擎
gulp.task('ejs', function() {
    gulp.src('src/templates/**.ejs')
        .pipe(plugins.ejs())
        .pipe(gulp.dest('dist'));
});

// 公共部分html
gulp.task('fileinclude', function() {
    gulp.src('src/**.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('test'))
        .pipe(browserSync.stream());
});

// 删除dist文件夹  
gulp.task('clean', function() {
    return gulp.src([
        'dist',
        'dist/test/**/*',
        '!package.json',
        'dist.zip'
    ]).pipe(plugins.clean());
});

// 预编译Sass
gulp.task('sass', () => {
    return gulp.src('src/sass/*.scss') //指明源文件路径 读取其数据流
        .pipe(plugins.plumber()) //替换错误的pipe方法  使数据流正常运行
        .pipe(plugins.sourcemaps.init()) //压缩环境出现错误能找到未压缩的错误来源
        .pipe(plugins.sass.sync({ //预编译sass
            outputStyle: 'expanded', //CSS编译后的方式
            precision: 10, //保留小数点后几位
            includePaths: ['.']
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] }))
        .pipe(plugins.sourcemaps.write('.')) //map文件命名
        .pipe(gulp.dest('test/css')) //指定输出路径
        .pipe(browserSync.stream());
});

// 编译es6
gulp.task('scripts', () => {
    return gulp.src('src/scripts/**/*.js')
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('test/js'))
        .pipe(browserSync.stream());
});

// 压缩图片
gulp.task('images', () => {
    return gulp.src('src/imgs/**/*')
        .pipe(plugins.cache(plugins.imagemin({ //使用cache只压缩改变的图片
            optimizationLevel: 3, //压缩级别
            progressive: true,
            interlaced: true
        }))).pipe(gulp.dest('dist/img'));
});
// 实际项目图片太多不适合打包
gulp.task('copyimgsToTest', function() {
    return gulp.src('src/imgs/**/*')
        .pipe(gulp.dest('test/imgs'))
});
// 实际项目引用的文件太多不适合打包到一起
gulp.task('copyLibsToTest', function() {
    return gulp.src('src/libs/**/*')
        .pipe(gulp.dest('test/libs'))
});
// 实际项目图片太多不适合打包
gulp.task('copyimgsTodist', function() {
    return gulp.src('src/imgs/**/*')
        .pipe(gulp.dest('dist/imgs'))
});
// 实际项目引用的文件太多不适合打包到一起
gulp.task('copyLibsTodist', function() {
    return gulp.src('src/libs/**/*')
        .pipe(gulp.dest('dist/libs'))
});

// html压缩，CSSJS合并压缩，加上时间戳避免缓存
gulp.task('html', ['fileinclude', 'copyimgsTodist', 'copyLibsTodist'], () => { //先执行fileinclude任务
    var version = (new Date).valueOf() + '';
    var options = {
        removeComments: false, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false, //删除<style>和<link>的type="text/css"
        minifyJS: false, //压缩页面里的JS
        minifyCSS: false //压缩页面里的CSS
    };
    return gulp.src('test/*.html')
        .pipe(plugins.plumber())
        //将页面上 <!--endbuild--> 根据上下顺序合并
        .pipe(plugins.useref({ searchPath: ['test', '.'] }))
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.cssnano()))
        .pipe(plugins.if('*.html', plugins.htmlmin(options)))
        //这种方法比较不成熟 每一次的任务都会改变，不管文件是否被修改 
        .pipe(plugins.replace('.js"></script>', '.js?v=' + version + '"></script>'))
        .pipe(plugins.replace('.css">', '.css?v=' + version + '">'))
        .pipe(gulp.dest('dist'));
});

// 本地服务和自动刷新
gulp.task('serve', ['fileinclude', 'sass', 'scripts', 'copyimgsToTest', 'copyLibsToTest'], () => {
    browserSync({
        notify: false,
        port: 8080,
        server: {
            baseDir: ['test']
        }
    });
    //监测文件变化 实行重新加载
    // gulp.watch([
    //     'src/*.html',
    //     'src/imgs/**/*',
    // ]).on('change', reload);
    //监测变化 执行sass任务
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/**/*.html', ['fileinclude']);
    gulp.watch('src/templates/**/*.html', ['fileinclude']);
});

// 压缩dist文件夹
gulp.task('zip', function() {
    return gulp.src('dist/**/*')
        .pipe(plugins.zip('dist.zip'))
        .pipe(gulp.dest('./'));
});

// 打包任务
gulp.task('build', ['html'], () => {
    return gulp.src('dist/**/*')
        .pipe(plugins.size({ title: 'build', gzip: true }));
});

// 将默认的任务代码放在这 
gulp.task('default', (cb) => {
    plugins.runSequence('clean', 'build', 'zip', function(){
        console.log('build success!!')
    });
});
// 创建项目源文件目录任务 命令行 gulp createSrcDir执行
gulp.task('createSrcDir', function() {
    var srcHtml = './src/', //页面文件源文件目录
        srcJS = './src/sass/', //JS源文件目录
        srcCSS = './src/scripts/', //SCSS源文件目录
        srcImage = './src/imgs/', //图片源文件目录
        srcComp = './src/templates/', //组件文件源文件目录
        srcLib = './src/libs/'; //组件文件源文件目录
    var dirs = [srcJS, srcCSS, srcImage, srcComp, srcHtml, srcLib];
    // 生成项目结构
    dirs.forEach(dir => {
        mkdirp.sync(dir);
    });
});