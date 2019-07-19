// let r = require('./a')  //默认会增加.js   .json等后缀的策略

//commonjs  require方法的实现
//-内置实现了一个require方法
//-通过Module._load方法加载模块
//-Module._resolveFilename 根据相对路劲解析绝对路劲，并且增加后缀
//-模块的缓存问题 Module._cache
//-new Module 创建模块，id存放名字，exports={} 存放模块导出的内容
//-tryModuleLoad(module) 尝试加载这个模块
//    -取出文件后缀
//    -加载模块 （读取文件）
//    -Module.wrap 包裹读取的内容   (.js)
//    -使用 runInThisContext 运行字符串  
//    -让字符串执行 this改变为exports

let path=require('path');
let fs=require('fs');
let vm=require('vm')
function Module(id){
    this.id=id;
    this.exports={};
}
Module.wrapper=[
    "(function(exports,module,require,__dirname,__filename){",
    "\n})"
]
Module._extension={
    '.js'(module){
        //读取内容
        let content = fs.readFileSync(module.id,'utf8');
        //包裹
        let fnStr = Module.wrapper[0]+content+Module.wrapper[1];
        //在沙箱中执行
        let fn = vm.runInThisContext(fnStr);
        //执行fn
        fn.call(module.exports,module.exports,module,req);
    },
    '.json'(module){
        //读取内容
        let json = fs.readFileSync(module.id,'utf8');
        //赋值给exports
        module.exports=json;
    }

}
function tryModuleLoad(module){
    //获取文件后缀
    let extension = path.extname(module.id);
    //通过后缀加载当前文件
    Module._extension[extension](module);
}
Module._resolveFilename=function(modulePath){
    //获取要加载的文件的绝对路劲
    let absPathname = path.resolve(__dirname,modulePath);
    //获取可能的能后缀名
    let extNames = Object.keys(Module._extension);
    let index=0;
    let oldName=absPathname;
    function find(pathname){
        if(index === extNames.length){
            throw new Error('can not find file'+modulePath);
            return;
        }
        try {
            fs.accessSync(pathname);
            return pathname;
        } catch (e) {
            let ext=extNames[index++];
            let newPath=oldName+ext;
            return find(newPath);
        }
    }
    return find(absPathname);   //返回添加后缀之后的绝对路径名
}
Module._cache={};
function req(modulePath){
    //获得添加后缀名之后的绝对路劲
    let absPathname;
    try {
        absPathname=Module._resolveFilename(modulePath)        
    } catch (e) {
        console.error(e);
        return;
    }
    //读取缓存
    if(Module._cache[absPathname]){
        return Module._cache[absPathname].exports;
    }
    //创建模块
    let module = new Module(absPathname);
    tryModuleLoad(module);  //尝试加载当前模块
    //缓存模块
    Module._cache[absPathname]=module;
    return module.exports;  //require方法会默认返回exports对象
}

let obj=req('./a');
obj=req('./a');
console.log(obj)

//module.exports和exports的区别
//module.exports=exports={}
//exports是module.exports的别名，但是不能直接改变exports的引用，因为不会影响module.exports对象的值