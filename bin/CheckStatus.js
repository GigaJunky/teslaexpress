const
 voptions = require('../data/vtoken.json')
, Poller = require('./poller')
, tjx = require ('../routes/teslaxlib')

let pollInterval = 30, polCount = 1, loElapsedLimit = 30
, lvd = tjx.lastVehicleDataAsync(voptions)
, lastOnline = lvd.vehicle.vehicle_state.timestamp
, loElapsedMins = (Date.now() - lastOnline) / 60000
console.log(`!LastOnline %s loElapsedMins: %s, %s`,  new Date(lastOnline).toLocaleString(), round(loElapsedMins, 2),  elapsedSC(lastOnline))

let poller = new Poller( pollInterval * 1000)

poller.onPoll(() => {
    CheckStates()
    poller.poll(pollInterval * 1000)
    console.log('polCount:  ', polCount++)
})

process.stdout.write('\033c')
CheckStates()
poller.poll(pollInterval * 1000)

function CheckStates()
{
    let now = new Date()
    tjx.vehicles(voptions, (err, vehicles) => {
        if(err) console.error(err)
        if(!vehicles) console.error('No Vehicles?!')
        if(vehicles)
        for(let v of vehicles){
            if(loElapsedMins > loElapsedLimit){
                if(v.state !== 'online'){
                    lvd = tjx.lastVehicleDataAsync(voptions)
                    lastOnline = lvd.vehicle.vehicle_state.timestamp
                    tjx.wakeUp(voptions, (err, result) => {
                        console.log("Waking up, Vehicle state: ", err ,  result ? result.state : result)
                    })
                } else {
                    tjx.vehicleData(voptions, (err, vehicle) =>{
                        if (err) console.error('vdata err: ', err)
                        else {
                            let vs = vehicle.vehicle_state
                            let ds = vehicle.drive_state
                            console.log(`veh online: shift: %s odometer %s user: %s near homelink: %s delta: %s`,
                            ds.shift_state, vs.odometer, vs.is_user_present, vs.homelink_nearby, vehicle.delta)
                            lastOnline = vehicle.vehicle_state.timestamp
                             pollInterval = vs.is_user_present ? 60 : 30 * 60
                             console.log(`user: %s polInterval: %s`, vs.is_user_present, pollInterval)
                        }
                    })
                }
                loElapsedMins = (Date.now() - lastOnline) / 60000
            }

            console.log(`vehicle: %s  state: %s now: %s`, v.display_name, v.state, now.toLocaleString())

            loElapsedMins = (Date.now() - lastOnline) / 60000
            console.log(`LastOnline %s loElapsedMins: %s, %s`,  new Date(lastOnline).toLocaleString(), round(loElapsedMins, 2),  elapsedSC(lastOnline))
        }
    })
}

//https://stackoverflow.com/questions/13903897/javascript-return-number-of-days-hours-minutes-seconds-between-two-dates
function elapsedSC(timestamp)
{
    let r = {}, d = Math.abs(Date.now() - timestamp) / 1000
    , s = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60,second: 1 } // uncomment row to ignore// feel free to add your own row
    Object.keys(s).forEach(function(key){
        r[key] = Math.floor(d / s[key])
        d -= r[key] * s[key]
    })
    return `${r.day}:${r.hour}:${r.minute}:${r.second}`
    //console.log(r) // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
    //console.log(`${r.day}:${r.hour}:${r.minute}:${r.second}`)
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }
