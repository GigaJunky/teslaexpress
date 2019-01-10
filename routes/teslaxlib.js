const fs = require('fs')
, tjs = require('teslajs')
, tjx = require('../routes/teslaxlib')
, voptions = require('../data/vtoken.json')

let lastWakeup = Date.now(), lastVData
  
const jdOpts = {
    textDiff: { minLength: 160 },
    propertyFilter: function(name, context) {
        if(name === 'timestamp') return false
        if(name === 'gps_as_of') return false
        if(name === 'tokens') return false
        return true
      }
  }
, jsondiffpatch = require('jsondiffpatch').create(jdOpts)
, dataPath = __dirname + '/../data/'
, vdataFN = dataPath + 'vdata.json'
  
/**
 * saves json as vdata.json and compares with jsondiffpatch and saves if there are any differences and saves as vdelta + vehicle_state.timestamp (ignoring timestamp, gps_as_of, tokens)
 * @param {*} ujson updated json
 */
function saveData(ujson) {
    let lvd = lastVehicleDataAsync(voptions)
    lastVData = Date.now()
    let pjson = {}
    if(lvd.err) console.error('saveData readData error: ', lvd.err)
    else pjson = lvd.vehicle

    let delta = jsondiffpatch.diff(pjson, ujson)
    console.log('delta: ', delta ? delta : 'no change')
    if(delta){
    let timestamp = ujson.vehicle_state.timestamp
    let sjson =  JSON.stringify( ujson, null, '\t')
    fs.writeFile(vdataFN,                   sjson, (e, d) => { if(e) console.log(e) } )
    fs.writeFile(dataPath + 'vdata'  + timestamp + '.json', sjson, (e, d) => { if(e) console.log(e) } )
    fs.writeFile(dataPath + 'vdelta' + timestamp + '.json', JSON.stringify( delta, null, '\t'), (e, d) =>  { if(e) console.log(e) } )
    }
    return delta
}

function lastVehicleDataAsync(voptions){
    try {
        return  {err: null, vehicle: JSON.parse(fs.readFileSync(vdataFN))}
    } catch(e){
        return  {err: e, vehicle: { vehicle_state:{ timestamp: Date.now() - 3600000 } } }
    }
}

  function vehicleData(voptions, cb){
    tjs.vehicleData(voptions, (err, vehicle) => {
      if (!err) vehicle.delta = saveData(vehicle)
      cb(err, vehicle)
    })
  }


function wakeUp(voptions, cb) {
    let wuElapsed = (Date.now() - lastWakeup) / 1000
    //,   vdElapsed = Date.now() - lastVData  / 1000
    if ( wuElapsed < 60) // || vdElapsed < 30 * 60 )
        cb('last wakeup elasped:' + wuElapsed, null )
    else
    tjs.wakeUp(voptions, (err, vehicles) => {
        console.log('Waking Up: ', wuElapsed)
        if(!err) lastWakeup = Date.now()
        cb(err, vehicles)
    })
}

/** */
/*
function readData(cb) {
    fs.readFile(vdataFN, (e, d) =>{
        if(e)
        cb (e, { vehicle_state:{ timestamp: Date.now() - 3600000 } })
        else
        cb(e, JSON.parse(d))
    })
}
function f2c(degf) { return (degf - 32) * 5 / 9 }

function lastVehicleData(voptions, cb){
    readData((err, vehicle) => {
        cb(err, vehicle)
    })
}

function vehicles(voptions, cb) {
    tjs.vehicles(voptions, (err, vehicles) =>  cb(err, vehicles) )
}

*/


 module.exports = {
      vehicles: tjs.vehicles,
      lastVehicleDataAsync: lastVehicleDataAsync,
      vehicleData: vehicleData,
      wakeUp: wakeUp
}