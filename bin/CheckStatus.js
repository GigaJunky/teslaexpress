const
 voptions = require('../data/vtoken.json')
, Poller = require('./poller')
, tjx = require ('../routes/teslaxlib')

var pollInterval = 1 * 60, sleepMins = 30, onlineMins = 5, lastWakeup, polCount = 1, loElapsedLimit = 5
, lvd = tjx.lastVehicleDataAsync(voptions)
, lastOnline = lvd.vehicle.vehicle_state.timestamp
, loElapsedMins = (Date.now() - lastOnline) / 60000

let poller = new Poller( pollInterval * 1000)

poller.onPoll(() => {
    CheckStates()
    poller.poll(pollInterval * 1000)
    console.log('polCount:  ', polCount++)
})

process.stdout.write('\033c')
CheckStates()
poller.poll()

function CheckStates()
{
    var now = new Date()
    tjx.vehicles(voptions, (err, vehicles) => {
        if(err) console.error(err)
        //console.log('v: ', vehicles)
        if(!vehicles) console.error('No Vehicles?!')
        //console.log('vs:',vehicles)
        //console.log('get Vehicles!: ', err, vehicles.length)
        if(vehicles)
        for(var v of vehicles){
            console.log("vehicle: ", v.display_name, v.state, v.in_service, now.toLocaleString())
            loElapsedMins = (Date.now() - lastOnline) / 60000
            console.log('loElapsedMins: ', loElapsedMins)

            switch(v.state) {
                /*
                case 'asleep':
                    console.log('lastOnline: ', new Date(lastOnline), elapsedSC(lastOnline))
                    tjx.lastVehicleData(voptions, (err, vehicle) =>{
                        lastOnline = vehicle.vehicle_state.timestamp
                        console.log('Offline lastVehicleData: ', err, elapsedSC(vehicle.vehicle_state.timestamp))
                    })
                if(false)
                    tjx.wakeUp(voptions, function (err, result) {
                        if (err) console.error('wakeup err: ', err)
                        else 
                        console.log("WakeUp command: Succeeded, Vehicle state: " + result.state)
                    })
                    break
                */
                case 'online':
                    console.log('online in service', v.in_service)
                    //if (!v.in_service)
                    UpdateTimes()
                    if(loElapsedMins > loElapsedLimit){
                        tjx.vehicleData(voptions, (err, vdata) =>{
                             if (err) console.error('vdata: ', err)
                             else
                             UpdateTimes()
                            })
                    }
                    //else
                    //    tjx.lastVehicleData(voptions, (err, vehicle) =>{
                    //        console.log('Online !_in_service lastVehicleData: ', err,  elapsedSC(vehicle.vehicle_state.timestamp))
                    //    })

                    break
                default:
                    UpdateTimes()
                    console.log('Vehicle State Not Online : ',  v.state)
            }
            //if(v.state === 'online') vehicleData(voptions, (err, vdata) => console.log('vdata: ', err))
        }
    })
}

function UpdateTimes()
{
    console.log('UpdateTimes: ', new Date(lastOnline).toLocaleString(), elapsedSC(lastOnline), loElapsedMins,  (loElapsedMins > loElapsedLimit) )

    if(loElapsedMins > loElapsedLimit){
        lvd = tjx.lastVehicleDataAsync(voptions)
        lastOnline = lvd.vehicle.vehicle_state.timestamp
        loElapsedMins = (Date.now() - lastOnline) / 60000
        tjx.wakeUp(voptions, function (err, result) {
            console.log("Waking up, Vehicle state: ", err , result)
        })
    }

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


