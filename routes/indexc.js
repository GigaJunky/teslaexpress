
const
  express = require('express')
  , router = express.Router()
  , tjs = require('teslajs')
  , voptions = require('../data/vtoken.json')
  , tjx = require ('./teslaxlib')


router.get('/vdatat', function (req, res, next) {
  tjx.readData((e, d) => {
   res.render('vdata', { title: 'Tesla Vehicle Data T', vdata: d })  
  })
})

router.get('/', function (req, res, next) {

  //var options = { authToken: token.access_token }

  tjs.vehicles(voptions, function (err, vehicles) {
    console.log("vehicles: ", err)
    if (!err){
    console.log('vehicles: ', vehicles)
    var vehicle = vehicles[0];

    if (vehicle.state !== "online") {
      tjs.wakeUp(voptions, function (err, result) {
        if (err) console.error(err)
        else console.log("WakeUp command: Succeeded, Vehicle state: " + result.state)
      })
    }
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
/**
 * @param {voptions} voptions - must contain the vehicle_ID
 * @param {*} cb callback vehicleData
 */
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
