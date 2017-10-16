前端自动化构建工具gulp
##全局安装gulp
全局安装gulp目的是为了通过她执行gulp任务；

    npm install gulp -g；
命令提示符执行gulp -v，出现版本号即为正确安装。

##新建项目文件

    npm init





##如果npm install --save-dev gulp——sass失败
1、首先全局环境下配置淘宝镜像（注意：这里是全局环境，不是项目根目录）执行语句：
    
    npm install -g cnpm --registry=https://registry.npm.taobao.org

2、进入项目根目录，安装执行语句：
    
    cnpm install --save-dev node-sass

3、仍然是项目根目录，安装执行语句： 
    
    npm install --save-dev gulp-sass

4、编译sass任务

    gulp.task('loadSass', function() {
        return gulp.src('src/css/**/*.scss')
            .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
            .pipe(gulp.dest('dist/css'))
    });

    // *.scss 匹配当前目录下所有以.scss结尾的文件
    // **/*.scss 匹配前目录及所有子目录下，所有以.scss结尾的文件
    // !not-me.scss不包含名为not-me.scss文件
    // *.+(scss|sass) 匹配当前目录下所有以.scss或者.sass结尾的文件
    // 嵌套输出方式 nested
    // 展开输出方式 expanded 
    // 紧凑输出方式 compact 
    // 压缩输出方式 compressed

