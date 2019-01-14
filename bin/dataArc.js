const fs = require('fs')

var path = '../data/'

fs.readdir(path, (err, items) => {
    for (var f of items.filter(o=> o.length !== 23 )){
        let file = path + f
        fs.stat( file,  (err, stats) => {
            let fd = file.match(/\d+/g)
            let fdn = fd ? parseInt( fd[0]) : 0
            console.log(file, Math.round(stats.ctimeMs) - fdn ,  fdn) //, stats.size )
        })
    }
})
