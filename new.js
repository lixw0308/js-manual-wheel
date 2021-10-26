function create(){
  const obj = {}
  const Fn = [].shift.call(arguments)
  obj.__proto__ = Fn.prototype
  let res = Fn.apply(obj, arguments)
  
  return res instanceof Object ? res : obj
}
