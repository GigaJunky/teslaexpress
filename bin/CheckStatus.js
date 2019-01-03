const
fs = require('fs')
tjs = require('teslajs')
 , voptions = require('../data/vtoken.json')
, Poller = require('./poller')


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

var pollMins = 1, sleepMins = 30, onlineMins = 5
let poller = new Poller( pollMins * 60 * 1000)

poller.onPoll(() => {
    CheckStates()
    poller.poll()
})

CheckStates()
poller.poll()

function CheckStates()
{
    tjs.vehicles(voptions, function (err, vehicles) {
        if(err) console.log(err)
        for(var v of vehicles){
            console.log("vehicles: ", v.display_name, v.state, new Date().toLocaleString())
            switch(v.state) {
                case 'asleep':
                    tjs.wakeUp(voptions, function (err, result) {
                        if (err) console.error(err)
                        else console.log("WakeUp command: Succeeded, Vehicle state: " + result.state)
                    })
                    break
                case 'online':
                    vehicleData(voptions, (err, vdata) => console.log('vdata: ', err))
                    break
                default:
                    console.log('poll State Not online : ',  v.state )


            }
            //if(v.state === 'online') vehicleData(voptions, (err, vdata) => console.log('vdata: ', err))
        }
    })
}

function vehicleData(voptions, cb){
    tjs.vehicleData(voptions, function (err, vehicle) {
      if (!err){
        //console.log("\nVehicle " + vehicle.vin + " - " + tjs.getModel(vehicle) + " ( '" + vehicle.display_name + "' ) is: " + vehicle.state)
        saveFile(vehicle)
      }
      //console.log('Veh Data:', err, vehicle)
      return cb(err, vehicle)
    })
  }

  function saveFile(ujson) {
    fs.readFile('../data/vdata.json', (err, fdata) => {
      if(err) console.log('readfile error: ', err)
      var pjson = {}
      if(!err) pjson = JSON.parse(fdata)
      var delta = jsondiffpatch.diff(pjson, ujson)
      if(delta){
        console.log('save file delta: ', new Date().toLocaleString(), delta)
        console.log('saveFile: ', ujson.vehicle_state.timestamp)
        fs.writeFile('../data/vdata.json',                                       JSON.stringify( ujson, null, '\t'), (e, d) => console.log(e))
        fs.writeFile('../data/vdata'  + ujson.vehicle_state.timestamp + '.json', JSON.stringify( ujson, null, '\t'), (e, d) => console.log(e))
        fs.writeFile('../data/vdelta' + ujson.vehicle_state.timestamp + '.json', JSON.stringify( delta, null, '\t'), (e, d) => console.log(e))
      }
      else console.log('saveFile No Change', new Date().toLocaleString())
    })
}
/** */
function readFile(fn, cb) {
  fs.readFile('../data/vdata.json', (err, data) => {  
    cb( { err: err, data: data } )
  })
}
