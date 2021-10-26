function debounce(fn, wait) {
    let timer = null

    return function() {
        if(timer) clearTimeout(timer)

        timer = setTimeout(fn, wait)
    }
}

function throttle1(fn, delay) {
    let timer = null

    return function() {
        if(!timer) {
            timer = setTimeout(() => {
                fn()
                timer = null
            }, delay)
        }
    }
}

function throttle2(fn, delay) {
    let start = Date.now()

    return function() {
        let cur = Date.now()

        if(cur - start >= delay) {
            fn()
            start = cur
        }
    }
}

function throttle(fn, delay) {
    let start = Date.now()
    let timer = null

    return function() {
        let cur = Date.now()
        let remain = delay - (cur - start)
        clearTimeout(timer)
        if(remain <=0) {
            fn()
            start = cur
        } else {
            timer = setTimeout(fn, dealy)
        }
    }
}
