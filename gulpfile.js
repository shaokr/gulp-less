// 引入 gulp
// 俺就是任性就是不写注释
var gulp = require('gulp');

// 引入组件
//var jshint = require('gulp-jshint');  //检测js
var g_less = require('gulp-less'); //编译less
//var g_concat = require('gulp-concat');  // 合并文件
//var g_uglify = require('gulp-uglify');  // js压缩
//var g_minifyCSS = require('gulp-minify-css'); //压缩css
//var g_spriter = require('ispriter'); //
//var g_rename = require('gulp-rename');   // 重命名
var g_gutil = require("gulp-util"); //错误提示
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var readline=require('readline');
var _=require('underscore');
var fs = require('fs');
var paths = require('path');
// var md5File = require('md5-file');
// var fse = require('fs-extra');
//var livereload = require('gulp-livereload');
//var rimraf = require('rimraf');
//配置目录
var path2 = {
    less: '../_less', //less所在位置
};
var config={
    browsers: ['> 1%', 'last 12 versions']
}

var o=0;
//var lessList=[path.less+"/*.less"];
var src_rep = {
    list: [
        {
            rep:'waphtml/static/_less',
            src:'public/static/css',
            map:true
        },
        {
            rep: '_less',
            src: 'css',
            map:true
        },
        
    ],
    new_list:{ // 根据list分析
        map:{ // 以是否生成地图为主生成数据
            yes:[],
            no:[]
        }
    },
    init:function(){
        var self=this;
        _.each(this.list,function(v,k){
            v.rep=v.rep.replace(/[\/]/g,'\\');
            v.src=v.src.replace(/[\/]/g,'\\');
            if(v.map){
                self.new_list.map.yes.push(v);
            }else{
                self.new_list.map.no.push(v);
            }
        });
    },
    bk:[],
    bk_list:{}, // { relate:[] }
    eve: function(path, name) {
        var self=this;
        var name = name || "/*.less";
        path = paths.resolve(path);
        _.each(self.new_list.map,function(v,k){
            var _list=_.map(v,function(v2){
                return path.replace(v2.rep, v2.src);
            });
            _list.length && self.generate(path+name,_list,k=='yes'?1:0);
        });

        console.log(path);
    },
    eve2:function(path) {
        var self=this;
        path = paths.resolve(path);
        
        _.each(self.new_list.map,function(v,k){
            var _list=_.map(v,function(v2){
                var a = path.lastIndexOf('\\');
                var _url = path.substring(0, a);
                _url= _url.replace(v2.rep, v2.src);
                return _url;
            });
            _list.length && self.generate(path,_list,k=='yes'?true:false);
        });
        o++;
        console.log(path)
    },
    /**
     * [generate description]
     * @param  {[type]} path  [编译文件]
     * @param  {[type]} url   [编译后目录]
     * @param  {[type]} ifmap [是否生成地图]
     */
    generate:function(path,url,ifmap){
        // console.log(ifmap);
        // return;
        var gulp_task=gulp.src(path);
        // if(ifmap)
        ifmap && (gulp_task=gulp_task.pipe(sourcemaps.init()))

        gulp_task=gulp_task.pipe(g_less().on("error", g_gutil.log))
                .pipe(autoprefixer({
                    browsers: config.browsers,
                    cascade: true
                }));
                // .pipe(gulp.dest(url[1]));
        ifmap && (gulp_task=gulp_task.pipe(sourcemaps.write()))

        _.each(url,function(v){
            gulp_task.pipe(gulp.dest(v));
        });
        
    }
}
src_rep.init();
function walk(path) {
    var files = fs.readdirSync(path);
    // lessList.push(path+"/*.less");
    src_rep.bk.push(path);
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
};

walk(path2.less);

gulp.task('all-less', function() {
     _.each(src_rep.bk,function(v){
        // _.each(v,function(v2){
            src_rep.eve(v);
        // });
    });
});


// 监听文件变化
gulp.task('default', function() {
    // gulp.run('less');
    var watcher = gulp.watch(path2.less + "/**/*.less");
    watcher.on('change', function(event) {
        // console.log(event)
        console.log("------------------------------------编译执行------------------------------------");
        console.time("耗时");
        o=0;
        var a = event.path.lastIndexOf('\\');
        if (event.path.indexOf("no_") === -1) {
            src_rep.eve2(event.path);
        } else {
            _.each(src_rep.bk_list[event.path],function(v){
                src_rep.eve2(v);
            });
        }
        // console.timeEnd("耗时");
        // console.log("-------------------------编译结束(文件生成需要时间)------------------------");
    });
    var watcher_css = gulp.watch("../css/**/*.css",function(){
        if(--o==0){
            console.timeEnd("耗时")
            console.log("------------------------------------编译结束------------------------------------");
        }
    });

});


// 默认任务
//gulp.task('default',['lint', 'less', 'scripts']);