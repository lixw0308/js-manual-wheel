//自己实现的promise
function Promise(executor) {
    let self = this;
    self.value = null;
    self.reason = null;
    self.status = 'pending'; //默认状态为等待态
    self.onResolvedCallbacks = []; //存放所有成功的回调函数
    self.onRejectedCallbacks = []; //存放所有失败的回调函数

    function resolve(value) {
        if (self.status === 'pending') {
            self.value = value;
            self.status = 'fulfilled'; //变为成功态
            //发布
            self.onResolvedCallbacks.forEach(fn => fn());
        }
    }

    function reject(reason) {
        if (self.status === 'pending') {
            self.reason = reason;
            self.status = 'rejected'; //变为失败态
            //发布
            self.onRejectedCallbacks.forEach(fn => fn());
        }
    }
    try {
        executor(resolve, reject);        
    } catch (e) {
        reject(e);
    }
}
//这个方法是规范的，我们的promise可能会被别人也使用
// let index=2;
// Object.defineProperty(x,then,{
//     get(){
//         if(--index===0){
//             throw new Error();
//         }
//     }
// })
function resolvePromise(promise2, x, resolve, reject) { //判断x是不是promise实例
    if (promise2 === x) { //防止自己等待自己
        return reject(new TypeError('循环引用！'));
    }
    let called = false; //表示当前有没有被调用过
    //保证x是一个引用类型
    if ((x !== null && typeof x === 'object') || typeof x === 'function') {
        //x有可能是个promise
        try {
            //保证只取一次x.then
            let then = x.then; //then属性可能具有getter，取得时有可能抛错--极端情况   
            if (typeof then === 'function') { //默认x是promise
                then.call(x, y => { //y有可能是promise
                    if (called) return;     //给别人的promise增加的判断逻辑
                    called = true;
                    //一直解析，直到结果是常量为止
                    resolvePromise(promise2, y, resolve, reject);
                    // resolve(y);     //拿到成功的结果让promise变成成功态
                }, r => {
                    if (called) return;
                    called = true;
                    reject(r);
                })
            } else { //x是普通对象
                resolve(x);
            }
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x); //x是普通值，直接成功
    }

}
Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled=typeof onFulfilled === 'function'?onFulfilled : value=>value;
    onRejected=typeof onRejected === 'function'?onRejected : err=>{throw err};
    let self = this;
    //调用then后需要再次返回一个新的promise对象
    //需要得到当前then方法之后的返回值
    let promise2 = new Promise((resolve, reject) => {
        if (self.status === 'fulfilled') {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        }
        if (self.status === 'rejected') {
            setTimeout(() => {
                try {
                    let x = onRejected(self.reason);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        }
        if (self.status === 'pending') {
            //订阅
            self.onResolvedCallbacks.push(function () {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0)
            });
            self.onRejectedCallbacks.push(function () {
                setTimeout(() => {
                    try {
                        let x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            });
        }
    });
    return promise2;

}

Promise.all=function(values){
    return new Promise((resolve,reject)=>{
        let arr=[]; //最终结果的数组
        let index=0;
        function processData(key,value){
            index++;
            arr[key]=value;
            if(index===values.length){  //最终结果个数和values个数相等
                resolve(arr);
            }
        }
        for(let i=0;i<values.length;i++){
            let current = values[i];
            if(current && current.then &&typeof current.then === 'function'){
                //promise
                current.then(y=>{
                    processData(i,y);
                },reject);
            } else {
                processData(i,current);
            }
        }
    });
}
Promise.race=function(values){
    return new Promise((resolve,reject)=>{
        for(let i=0;i<values.length;i++){
            let current = values[i];
            if(current && current.then &&typeof current.then === 'function'){
                //promise
                current.then(resolve,reject);
            } else {
                resolve(current);
            }
        }
    });
}
Promise.resolve=function(){
    return new Promise((resolve,reject)=>{
        resolve();
    })
}
Promise.reject=function(){
    return new Promise((resolve,reject)=>{
        reject();
    })
}

module.exports = Promise;
