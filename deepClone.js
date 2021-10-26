
function deepClone(origin, record = new WeakMap()) {
    if(origin == null) return origin 
    if(typeof origin === 'function') return origin
    if(typeof origin !== 'object') return origin

    if(record.has(origin)) return record.get(origin)
    const res = new origin.constructor()
    record.set(origin, res)

    for(const key in origin) {
        res[key] = deepClone(origin[key], record)
    }

    return res
}

// Test
const obj1 = {
    a: 1,
    getName(){ console.log(this.a) },
    b: 'str',
    c: null,
    d: {
        da: 22
    },
    e: {
        self: null
    }
}
obj1.e.self = obj1
const obj2 = deepClone(obj1)

obj1.d.da = 243
console.log(obj1, obj2)
