var fs = require('fs')
var options = {
    textDiff: { minLength: 160 },
    propertyFilter: function(name, context) {
        if(name === 'timestamp') return false
        if(name === 'gps_as_of') return false
        if(name === 'tokens') return false
        return true
      },
}
var jsondiffpatch = require('jsondiffpatch').create(options);

/*  
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}
var path = process.argv[2]
*/
path = './'

fs.readdir(path, function(err, items) {
    items = items.filter(o => o.length === 23).sort().reverse()
    var len = items.length
    for (var i=1; i<len; i++){
        //console.log(items[i], items[i-1])
        try {
            var j1 = JSON.parse(fs.readFileSync(items[i]))
            var j2 = JSON.parse(fs.readFileSync( items[i -1]))
            var delta = jsondiffpatch.diff(j1, j2)
            //console.log(items[i], items[i-1])
            if(delta){
                 var fdt = items[i].match(/\d+/g)
                 console.log('file date time: ', new Date(parseInt(fdt)).toLocaleString() ) 
                 console.log(items[i], items[i-1], delta)
                 
            }
        }catch (err) {
            console.log('err: ', items[i], items[i-1], err)
        }
    }
    console.log(items.length)
})