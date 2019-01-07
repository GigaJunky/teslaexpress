const
 voptions = require('../data/vtoken.json')
, Poller = require('./poller')
, tjx = require ('../routes/teslaxlib')

var pollInterval = 60, sleepMins = 30, onlineMins = 5, lastWakeup
let poller = new Poller( pollInterval * 1000)

poller.onPoll(() => {
    CheckStates()
    poller.poll()
})

CheckStates()
poller.poll()

function CheckStates()
{
    var now = new Date()
    tjx.vehicles(voptions, (err, vehicles) => {
        console.log('get Vehicles!: ', err, vehicles.length)
        if(err) console.error(err)

        for(var v of vehicles){
            console.log("vehicle: ", v.display_name, v.state, v.in_service, now.toLocaleString())
            switch(v.state) {
                case 'asleep':
                    if(false)
                    tjx.wakeUp(voptions, function (err, result) {
                        if (err) console.error('wakeup err: ', err)
                        else 
                        console.log("WakeUp command: Succeeded, Vehicle state: " + result.state)
                    })
                    break
                case 'online':
                    console.log('online in service', v.in_service)
                    //if (!v.in_service)
                        tjx.vehicleData(voptions, (err, vdata) =>{ if (err) console.error('vdata: ', err)})
                    //else
                    //    tjx.lastVehicleData(voptions, (err, vehicle) =>{
                    //        console.log('Online !_in_service lastVehicleData: ', err,  elapsedSC(vehicle.vehicle_state.timestamp))
                    //    })

                    break
                default:
                    console.log('poll State Not online : ',  v.state )
                    tjx.lastVehicleData(voptions, (err, vehicle) =>{
                        console.log('Offline lastVehicleData: ', err, elapsedSC(vehicle.vehicle_state.timestamp))
                    })
            }
            //if(v.state === 'online') vehicleData(voptions, (err, vdata) => console.log('vdata: ', err))
        }
    })
}

function elapsed(timestamp)
{
    var now = Date.now()
    console.log('elapsed', timestamp, now, (now - timestamp) / 1000)
}

//https://stackoverflow.com/questions/13903897/javascript-return-number-of-days-hours-minutes-seconds-between-two-dates
function elapsedSC(timestamp)
{
    var r = {}, d = Math.abs(Date.now() - timestamp) / 1000
    , s = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60,second: 1 } // uncomment row to ignore// feel free to add your own row
    Object.keys(s).forEach(function(key){
        r[key] = Math.floor(d / s[key])
        d -= r[key] * s[key]
    })
    return `${r.day}:${r.hour}:${r.minute}:${r.second}`
    //console.log(r) // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
    //console.log(`${r.day}:${r.hour}:${r.minute}:${r.second}`)
}


