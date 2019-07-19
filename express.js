let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
// let methods = require('methods');   //express使用的第三方模块，包含了所有的请求方法
function application(){
    //请求到来时，会执行此方法
    let app=(req,res)=>{
        let {pathname} = url.parse(req.url);
        let requestMethod = req.method.toLowerCase();
        let index=0;
        function next(err){    //co
            if(index >= app.routers.length){
                res.statusCode=404;
                return res.end('404 Not Found');
            }
            let {path,method,handler} = app.routers[index++];
            if(err){
                if(method === 'middleware' && handler.length === 4){
                    return handler(err,req,res,next);
                } else {
                    next(err);
                }
            } else {
                if(method === 'middleware'){
                    //路径相同  路径是/ 路径开头
                    if(pathname === path || path ==='/' || pathname.startsWith(path+'/')){
                        return handler(req,res,next);   //将next交给用户，由用户决定是否执行
                    } else {
                        next();
                    }
                } else {
                    if(path.params){    //是动态路径
                        let matches = pathname.match(path);
                        if(matches){
                            let [,...list] = matches;
                            req.params=path.params.reduce((memo,current,index)=>(memo[current]=list[index],memo),{});
                            return handler(req,res);
                        }
                    }
                    if((pathname === path || path==='*') && (requestMethod === method) || (method==='all')){
                        return handler(req,res);
                    }
                    next();
                }
            }
            
        }
        next();
    }
    app.routers=[]; //将路由保存起来
    let methods = ['get','post'];
    [...methods,'all'].forEach(method=>{
        app[method]=function(path,handler){
            //path  /user/:id/:name   动态路由
            let params=[];
            if(path.includes(':')){
                path=path.replace(/:([^\/]*)/g,function(){
                    params.push(arguments[1]);
                    return '([^\/]*)';
                });
                path = new RegExp(path);
                path.params=params;
            }
            let layer={
                path,
                method,
                handler
            };
            app.routers.push(layer);
        };
    });
    app.use=function(path,handler){
        if(typeof handler != 'function'){
            handler=path;
            path='/';   //处理中间件参数 默认path是 / 
        }
        let layer={
            method:'middleware',
            path,
            handler
        };
        app.routers.push(layer);
    }


    app.listen=function(){
        let server=http.createServer(app);
        server.listen(...arguments);
    }
    //内置中间件 每次请求都会执行处理
    app.use((req,res,next)=>{
        let url = require('url');
        let {path,query} = url.parse(req.url,true);
        req.path = path;
        req.query=query;
        res.send=function(value){
            if(typeof value === 'object'){
                res.setHeader('Content-Type','application/json;charset=utf-8');
                res.end(JSON.stringify(value));
            } else if(typeof value === 'number'){
                let status = require('_http_server').STATUS_CODES;  //私有模块，存放status对应的返回内容
                res.end(status[value]);
            } else if(typeof value === 'string' || Buffer.isBuffer(value)){
                res.setHeader('Content-Type','text/html;charset=utf-8');
                res.end(value);
            }
        }
        res.sendFile=function(p){
            //mime 处理类型
            fs.createReadStream(p).pipe(res);
        }
        next();
    });

    return app;
}

application.static=function(root){
    return function(req,res,next){
        let p=req.path;
        let absPath=path.join(root,p);
        fs.stat(absPath,(err,stat)=>{
            if(err){
                return next();
            }
            if(stat.isFile()){
                fs.createReadStream(absPath).pipe(res);
            }
        })
    }
}
module.exports = application;