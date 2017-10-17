import gulp from 'gulp';
//自动加载插件 省去一个一个require进来
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync'; //浏览器同步
const plugins = gulpLoadPlugins();
const reload = browserSync.reload;

// 删除dist文件夹  终端运行 "gulp clean"
gulp.task('clean', function() {
    return gulp.src([
        'dist', //删除dist整个文件夹
        'dist/test/**/*', //删除dist下的test写任意子文件夹里的文件
        '!package.json' //不删除package.json文件
    ]).pipe(plugins.clean());
});

// 预编译Sass
gulp.task('styles', () => {
    return gulp.src('src/css/*.scss') //指明源文件路径 读取其数据流
        .pipe(plugins.plumber()) //替换错误的pipe方法  使数据流正常运行
        .pipe(plugins.sourcemaps.init()) //压缩环境出现错误能找到未压缩的错误来源
        .pipe(plugins.sass.sync({ //预编译sass
            outputStyle: 'expanded', //CSS编译后的方式
            precision: 10, //保留小数点后几位
            includePaths: ['.']
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] })) //自动匹配浏览器支持的后缀
        .pipe(plugins.sourcemaps.write('.')) //map文件命名
        .pipe(gulp.dest('dist/css')) //指定输出路径
});

// 转化es6的JS
gulp.task('scripts', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel()) //靠这个插件编译
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'));
});

// 压缩图片
gulp.task('images', () => {
    return gulp.src('src/img/**/*')
        .pipe(plugins.cache(plugins.imagemin({ //使用cache只压缩改变的图片
            optimizationLevel: 3, //压缩级别
            progressive: true,
            interlaced: true
        }))).pipe(gulp.dest('dist/img'));
});

// 引用字体文件
gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.   {eot,svg,ttf,woff,woff2}', function(err) {}) //main-bower-files会从bower.json文件里寻找定义好的主要文件路径
            .concat('src/fonts/**/*')) //将bootstrap-sass的fonts和src下我们自己选用的fonts合并起来
        .pipe(gulp.dest('dist/fonts'));
});

// CSS合并压缩，JS合并压缩，html压缩，加上时间戳避免缓存
gulp.task('html', ['styles', 'scripts', 'images'], () => { //先执行styles scripts任务
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
    return gulp.src('src/*.html')
        .pipe(plugins.plumber())
        .pipe(plugins.useref({ searchPath: ['src', '.'] })) //将页面上 <!--endbuild--> 根据上下顺序合并
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.cssnano()))
        .pipe(plugins.if('*.html', plugins.htmlmin(options)))
        .pipe(plugins.replace('.js"></script>', '.js?v=' + version + '"></script>')) //这种方法比较不成熟 每一次的任务都会改变，不管文件是否被修改 
        .pipe(plugins.replace('.css">', '.css?v=' + version + '">'))
        .pipe(gulp.dest('dist'));
});

// 本地服务和自动刷新
gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
    browserSync({
        notify: false,
        port: 8080, //端口号
        server: {
            baseDir: ['dist'] //确定根目录
        }
    });

    gulp.watch([ //监测文件变化 实行重新加载
        'src/*.html',
        'src/img/**/*'
    ]).on('change', reload);

    gulp.watch('src/css/**/*.scss', ['build']); //监测变化 执行styles任务
    gulp.watch('src/js/**/*.js', ['build']);
    gulp.watch('src/fonts/**/*', ['build']);
    // gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// 打包任务
gulp.task('build', ['html', 'images', 'fonts'], () => {
    return gulp.src('dist/**/*')
        .pipe(plugins.size({ title: 'build', gzip: true }));
});

// 将默认的任务代码放在这 
gulp.task('default', ['clean'], () => {
    gulp.start('build');
});

// 创建项目源文件目录任务 命令行 gulp createSrcDir执行
gulp.task('createSrcDir', function() {
    var srcHtml = './src/', //页面文件源文件目录
        srcJS = './src/js/', //JS源文件目录
        srcCSS = './src/css/', //SCSS源文件目录
        srcImage = './src/img/', //图片源文件目录
        srcFont = './src/fonts/', //字体图标源文件目录
        srcComp = './src/comp/', //组件文件源文件目录
        srcLib = './src/lib/', //组件文件源文件目录
        var dirs = [srcJS, srcCSS, srcFont, srcImage, srcComp, srcHtml, srcLib];
    // 生成项目结构
    dirs.forEach(dir => {
        mkdirp.sync(dir);
    });
});