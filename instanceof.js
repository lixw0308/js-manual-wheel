function Instanceof(letf, right) {
  const {prototype} = right
  letf = left.__proto__
  
  while(true){
    if(left == null) return false
    
    if(left === prototype) return true
    
    letf = left.__proto__
  }
}
