const jdOpts = {
  textDiff: { minLength: 160 },
  propertyFilter: function(name, context) {
      if(name === 'timestamp') return false
      if(name === 'gps_as_of') return false
      if(name === 'tokens') return false
      return true
    }
}

const
  fs = require('fs')
  , express = require('express')
  , router = express.Router()
  , tjs = require('teslajs')
  , voptions = require('../data/vtoken.json')
  , jsondiffpatch = require('jsondiffpatch').create(jdOpts)

  
function saveFile(ujson) {
    console.log('saveFile: ', ujson.vehicle_state.timestamp)

    fs.readFile('./data/vdata.json', (err, fdata) => {
      console.log('savefile: ', err)
      var pjson = {}
      if(!err) pjson = JSON.parse(fdata)
      var delta = jsondiffpatch.diff(pjson, ujson)
      console.log('delta: ', delta)
      if(delta){
        fs.writeFile('./data/vdata.json',                                       JSON.stringify( ujson, null, '\t'), (e, d) => console.log(e, d))
        fs.writeFile('./data/vdata'  + ujson.vehicle_state.timestamp + '.json', JSON.stringify( ujson, null, '\t'), (e, d) => console.log(e, d))
        fs.writeFile('./data/vdelta' + ujson.vehicle_state.timestamp + '.json', JSON.stringify( delta, null, '\t'), (e, d) => console.log(e, d))
      }
    })
}

function readFile(fn, cb) {
  fs.readFile('./data/vdata.json', (err, data) => {  
    cb( { err: err, data: data } )
  })
}

router.get('/vdatat', function (req, res, next) {
  fs.readFile('vdata.json', (e, d) => {
    res.render('vdata', { title: 'Tesla Vehicle Data T', vdata: JSON.parse(d) })
  })
})

router.get('/', function (req, res, next) {

  //var options = { authToken: token.access_token }

  tjs.vehicles(voptions, function (err, vehicles) {
    if (err) console.log("Error: " + err)
    console.log('vehicles: ', vehicles)
    var vehicle = vehicles[0];

    if (vehicle.state !== "online") {
      tjs.wakeUp(voptions, function (err, result) {
        if (err) console.error(err)
        else console.log("WakeUp command: Succeeded, Vehicle state: " + result.state)
      })
    }
    res.render('vehicles', {err: err, vehicles: vehicles })
    //res.json({err: err,  vehicles: vehicles})

  })
})

router.get('/vehicleData', function (req, res, next) {
  vehicleData(voptions, vehicle => {
    console.log('/vehicleData: ', vehicle)
    res.render('vdata', { title: 'Tesla Vehicle Data', vdata: vehicle })
  })
})

router.get('/vehicleControls', function (req, res, next) {
  vehicleData(voptions, vehicle => {
    console.log('/vehicleControls: ', vehicle)
    if(!vehicle) res.redirect('/')
    else
    res.render('vcontrols', { title: 'Tesla Vehicle Controls', vdata: vehicle })
    
  })
})


function vehicleData(voptions, cb){
  tjs.vehicleData(voptions, function (err, vehicle) {
    if (!err){
      console.log("\nVehicle " + vehicle.vin + " - " + tjs.getModel(vehicle) + " ( '" + vehicle.display_name + "' ) is: " + vehicle.state)
        saveFile(vehicle)
    }
    console.log('Veh Data:', err, vehicle)
    return cb(vehicle)
  })
}

function vehicleData(voptions, cb){
  tjs.vehicleData(voptions, function (err, vehicle) {
    if (!err){
      console.log("\nVehicle " + vehicle.vin + " - " + tjs.getModel(vehicle) + " ( '" + vehicle.display_name + "' ) is: " + vehicle.state)
        saveFile(vehicle)
    }
    console.log('Veh Data:', err, vehicle)
    return cb(vehicle)
  })
}


router.get('/wakeUp', function (req, res, next) {
  //tjs.wakeUp(voptions, (err, result) =>{
  tjs.post_command(voptions, "wake_up", null,  (err, result) =>{
    console.log('Wake Up:', new Date().toLocaleString() , err, result)
   res.json({ err: err, result: result })
  })
})

router.get('/honkHorn', function (req, res, next) {
  tjs.honkHorn(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/flashLights', (req, res, next) => {
  tjs.flashLights(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/openTrunk', (req, res, next) => {
  tjs.openTrunk(voptions, tjs.TRUNK, (err, result) => res.json({ err: err, result: result }))
})

router.get('/openFrunk', (req, res, next) => {
  tjs.openTrunk(voptions, tjs.FRUNK, (err, result) => res.json({ err: err, result: result }))
})

router.get('/doorLock', (req, res, next) => {
  tjs.doorLock(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/doorUnlock', (req, res, next) => {
  tjs.doorUnlock(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/climateStart', (req, res, next) => {
  tjs.climateStart(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/climateStop', (req, res, next) => {
  tjs.climateStop(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/startCharge', (req, res, next) => {
  tjs.startCharge(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/stopCharge', (req, res, next) => {
  tjs.stopCharge(voptions, (err, result) => res.json({ err: err, result: result }))
})

router.get('/setChargeLimit/:amt', (req, res, next) => {
  console.log('setChargeLimit/:amt', req.params.amt)
  tjs.setChargeLimit(voptions, parseInt(req.params.amt), (err, result) => res.json({ err: err, result: result }))
})

function f2c(degf) { return (degf - 32) * 5 / 9 }

router.get('/setTemps/:temp', (req, res, next) => {
  console.log('setTemps/:temp', req.params.temp)
  tjs.setTemps(voptions, f2c(parseInt(req.params.temp)), null, (err, result) => res.json({ err: err, result: result }))
})

router.get('/speedLimitSetLimit/:speed', (req, res, next) => {
  console.log('speedLimitSetLimit/:speed', req.params.speed)
  tjs.speedLimitSetLimit(voptions, parseInt(req.params.speed), (err, result) => res.json({ err: err, result: result }))
})


router.get('/homelink', (req, res, next) => {

  //tjs.driveState(voptions, function (err, drive_state) {
  fs.readFile('./data/vdata.json', (err, data) => {  
    console.log('Home Link read file: ', err)
  
    var vdata = JSON.parse(data)
    var drive_state = vdata.drive_state

    , lat   = drive_state.latitude
    , long  = drive_state.longitude
    , token = vdata.tokens[0]

    tjs.homelink(voptions, lat, long, token, (err, result) => {
      console.log('homelink: ',   lat, long, token, err, result)
      res.json({err: err, result: result})
    })

  })

})



module.exports = router
