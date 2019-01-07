const fs = require('fs')
, tjs = require('teslajs')
, tjx = require('../routes/teslaxlib')
, voptions = require('../data/vtoken.json')

var lastWakeup, lastVData
  
const jdOpts = {
    textDiff: { minLength: 160 },
    propertyFilter: function(name, context) {
        if(name === 'timestamp') return false
        if(name === 'gps_as_of') return false
        if(name === 'tokens') return false
        return true
      }
  }
const jsondiffpatch = require('jsondiffpatch').create(jdOpts)
const dataPath = __dirname + '/../data/'
const vdataFN = dataPath + 'vdata.json'
  
/**
 * saves json as vdata.json and compares with jsondiffpatch and saves if there are any differences and saves as vdelta + vehicle_state.timestamp (ignoring timestamp, gps_as_of, tokens)
 * @param {*} ujson updated json
 */
function saveData(ujson) {
    //console.log('saveData: ', ujson.vehicle_state.timestamp)

    readData((err, fdata) => {
      if(err) console.error('saveDile: ', err)
      lastVData = Date().now
      var pjson = {}
      if(!err) pjson = fdata
      var delta = jsondiffpatch.diff(pjson, ujson)
      console.log('delta: ', delta ? delta : 'no change', fdata.in_service)
      if(delta){
        var timestamp = ujson.vehicle_state.timestamp
        var sjson =  JSON.stringify( ujson, null, '\t')
        fs.writeFile(vdataFN,                   sjson, (e, d) => { if(e) console.log(e) } )
        fs.writeFile(dataPath + 'vdata'  + timestamp + '.json', sjson, (e, d) => { if(e) console.log(e) } )
        fs.writeFile(dataPath + 'vdelta' + timestamp + '.json', JSON.stringify( delta, null, '\t'), (e, d) =>  { if(e) console.log(e) } )
      }
    })
}

/** */
function readData(cb) {
    fs.readFile(vdataFN, (e, d) =>{
        cb(e, JSON.parse(d))
    })
}

//function f2c(degf) { return (degf - 32) * 5 / 9 }

function lastVehicleData(voptions, cb){
    readData((err, vehicle) => {
        cb(err, vehicle)
    })
}

function lastVehicleDataAsync(voptions){
    return  {err: null, vehicle: JSON.parse(fs.readFileSync(vdataFN))}
}

  function vehicleData(voptions, cb){
    tjs.vehicleData(voptions, function (err, vehicle) {
      if (!err) saveData(vehicle)
      else console.error('vehicleData err: ', err)
      return cb(err, vehicle)
    })
  }

function vehicles(voptions, cb) {
    tjs.vehicles(voptions, (err, vehicles) =>  cb(err, vehicles) )
}

function wakeUp(voptions, cb) {
    var wuElapsed = Date.now() - lastWakeup / 1000
    //,   vdElapsed = Date.now() - lastVData  / 1000
    if ( wuElapsed < 30) // || vdElapsed < 30 * 60 )
        cb('last wakeup elasped:' + wuElapsed  , null )
    else
    tjs.wakeUp(voptions, (err, vehicles) => {
        if(!err) lastWakeup = Date.now()
        cb(err, vehicles)
    })
}

 module.exports = {
      readData: readData,
      saveData: saveData,
      vehicles: vehicles,
      lastVehicleData: lastVehicleData,
      lastVehicleDataAsync: lastVehicleDataAsync,
      vehicleData: vehicleData,
      wakeUp: wakeUp
}