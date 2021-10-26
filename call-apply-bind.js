Function.prototype.myCall = function(ctx){
    if(typeof this !== 'function') throw Error('callee must be a function')

    const args = [...arguments].slice(1)

    ctx = ctx || window

    ctx.fn = this

    const res = ctx.fn(...args)

    delete ctx.fn

    return res
}

Function.prototype.myApply = function(ctx){
    if(typeof this !== 'function') throw Error('callee must be a function')

    ctx = ctx || window

    ctx.fn = this

    const res = arguments[1] ? ctx.fn(...arguments[1]) : ctx.fn()

    delete ctx.fn

    return res
}

Function.prototype.myBind = function(ctx){
    if(typeof this !== 'function') throw Error('callee must be a function')

    const args = [...arguments].slice(1)

    fn = this

    return function Fn(){
        return fn.apply(/* 函数有两种调用方式：new调用和()调用， 如果是new调用，this指向就是new出来的对象 */ this instanceof Fn ? this : ctx, args.concat(...arguments) )
    }
}

// TEST
this.info = 'I am window.info'
const a = {
    info: 'I am a.info'
}
const showInfoByArrowFn = n => console.log(n, this.info)
const showInfo =function(n){ console.log(n, this.info) }
console.log('**** this.info ****')
console.log(0, this.info)
console.log('**** showInfoByArrowFn ****')
showInfoByArrowFn(1)
showInfoByArrowFn.call(a, 2)
showInfoByArrowFn.apply(a, [3])
showInfoByArrowFn.bind(a, 4)()
console.log('**** showInfo ****')
showInfo(1)
showInfo.call(a, 2)
showInfo.apply(a, [3])
showInfo.bind(a, 4)()
console.log('**** showInfo by self ****')
showInfo(1)
showInfo.myCall(a, 2)
showInfo.myApply(a, [3])
showInfo.myBind(a, 4)()
