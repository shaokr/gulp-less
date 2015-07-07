// 引入组件
var gulp = require('gulp');
var g_less = require('gulp-less'); //编译less
var g_gutil = require("gulp-util"); //错误提示
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var readline=require('readline');
var _=require('underscore');
//配置目录
var path2 = {
    less: '../_less', //less所在位置
    rcss: '../css' //less编译成css后所在位置
};

var fs = require('fs');
var paths = require('path');
var src_rep = {
    // 
    list: [
        // {rep:/waphtml[\/\\]static[\/\\]_less/,src:'public/static/css-build',map:true},
        {
            rep: /waphtml[\/\\]static[\/\\]_less/,
            src: 'public/static/css',
            map: true
        }, {
            rep: /_less/,
            src: 'css',
            map: true
        }
    ],
    bk:[],
    bk_list:{}, // { relate:[] }
    eve: function(path, name) {
        var name = name || "/*.less";
        path = paths.resolve(path);
        console.log(path);
        _.each(this.list,function(v,k){
                _url = path.replace(v.rep, v.src);
            if (v.map) {
                gulp.src(path + name)
                    .pipe(sourcemaps.init())
                    .pipe(g_less().on("error", g_gutil.log))
                    .pipe(autoprefixer({
                        browsers: ['> 1%', 'last 12 versions'],
                        cascade: true
                    }))
                    .pipe(sourcemaps.write())
                    .pipe(gulp.dest(_url));
            } else {
                gulp.src(path + name)
                    .pipe(g_less().on("error", g_gutil.log))
                    .pipe(autoprefixer({
                        browsers: ['> 1%', 'last 12 versions'],
                        cascade: true
                    }))
                    .pipe(gulp.dest(_url));

            }
        });
        // console.log(path)
    },
    eve2: function(path) {
        path = paths.resolve(path);
        console.log(path);
        _.each(this.list,function(v,k){
            var a = path.lastIndexOf('\\');
            _url = path.substring(0, a);
            _url= _url.replace(v.rep, v.src);
            if (v.map) {
                gulp.src(path)
                    .pipe(sourcemaps.init())
                    .pipe(g_less().on("error", g_gutil.log))
                    .pipe(autoprefixer({
                        browsers: ['> 1%', 'last 12 versions'],
                        cascade: true
                    }))
                    .pipe(sourcemaps.write())
                    .pipe(gulp.dest(_url));
            } else {
                gulp.src(path)
                    .pipe(g_less().on("error", g_gutil.log))
                    .pipe(autoprefixer({
                        browsers: ['> 1%', 'last 12 versions'],
                        cascade: true
                    }))
                    .pipe(gulp.dest(_url));
            }
        });
        // console.log(path)
    }
}

function walk(path) {
    if(!src_rep.bk.length){
        files = fs.readdirSync(path);
        // lessList.push(path+"/*.less");
        src_rep.eve(path);
        src_rep.bk.push=[path];
        _.each(files,function(item) {
            var tmpPath = path + '/' + item,
                stats = fs.statSync(tmpPath);
            if(!stats.isDirectory()){
                // src_rep.bk_list[tmpPath]=[];

                var data = fs.readFileSync(tmpPath, {
                    encoding: "utf-8"
                });

                var import_list=data.match(/@import.+\.less["'];/g) || [];
                
                _.each(import_list,function(v,i){
                    var ph=v.match(/@\{.+?\}/g) || [];
                    _.each(ph,function(v2){
                        var _re=v2.replace(/[\{\} ]/g,"");
                        var ph2=data.match(new RegExp(_re+':(.+);')) || '';
                        v=v.replace(v2,ph2[1]);
                    });
                    v=v.replace('@import','');
                    v=v.replace(/["'; ]/g,'');
                    v=paths.resolve(path+"/"+v);
                    src_rep.bk_list[v]=src_rep.bk_list[v] || {};
                    src_rep.bk_list[v][tmpPath]=tmpPath;
                });
                
            }
            if (item.indexOf("no_") === -1 && stats.isDirectory()) {
                walk(tmpPath);
            }

        });
        
    }else{
        _.each(src_rep.bk,function(v){
            src_rep.eve(v);
        });
    }
};

gulp.task('all-less', function() {
    walk(path2.less,src_rep.bk.length);
});

// 监听文件变化
gulp.task('default', function() {
    var watcher = gulp.watch(path2.less + "/**/*.less");
    watcher.on('change', function(event) {
        console.log("-----------------------------编译执行------------------------------------");
        console.time("耗时");
        var a = event.path.lastIndexOf('\\');
        if (event.path.indexOf("no_") === -1) {
            src_rep.eve2(event.path);
        } else {
            _.each(src_rep.bk_list[event.path],function(v){
                src_rep.eve2(v);
            });
        }
        console.timeEnd("耗时");
        console.log("-------------------------编译结束(文件生成需要时间)------------------------");
    })
});


// 默认任务
//gulp.task('default',['lint', 'less', 'scripts']);