# gulp-less
主要功能：使用gulp自动编译less

## 其他
1. 根据less文件@import 实现关联,所以配置大部分在在less中
2. 过滤以 no_ 开头命名的less文件和文件夹(即不会编译成css文件)
3. 保存以 no_ 开头命名的less文件会编译所有@import了此文件的less
4. 可生成文件到多个目录中
5. 可选择生成地图（gulpfile.js 中配置

## 后续准备优化功能点
1. 以less文件夹为主，会复制一切非less文件和以'no_'开头的文件到css目录(这样就可以~只关心less文件目录即可~
2. 关联在保存的时候会重新获取(当前比如添加删除了新关联无效~
3. 会主动删除不存在的文件(主要是新建less文件的时候会马上生成没用的~
4. 编译js文件
5. 整合压缩
6. 整合雪碧图功能
