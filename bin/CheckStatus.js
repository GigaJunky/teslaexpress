const
 voptions = require('../data/vtoken.json')
, Poller = require('./poller')
, tjx = require ('../routes/teslaxlib')

let pollInterval = 10, polCount = 1, loElapsedLimit = 30 * 60000, lastCheckState = 0,  lastStateLimit = 5 * 60000
, lvd = tjx.lastVehicleDataAsync(voptions)
, lastOnline = lvd.vehicle.vehicle_state.timestamp
//, loElapsedMins = (Date.now() - lastOnline) / 60000
console.log(`Check State Started: LastOnline %s loElapsedMins: %s`,  new Date(lastOnline).toLocaleString(), elapsedSC(lastOnline))

let poller = new Poller( pollInterval * 1000)

poller.onPoll(() => {
    CheckStates()
    poller.poll(pollInterval * 1000)
    process.stdout.write("pollCount: " + polCount++ +  "\r");
})

process.stdout.write('\033c')
CheckStates()
poller.poll(pollInterval * 1000)

function elapsedMins(timestamp)
{
    return round((Date.now() - timestamp) / 60000, 2)
}

function CheckStates()
{
    let now = Date.now()
    if(now - lastCheckState> lastStateLimit)
    tjx.vehicles(voptions, (err, vehicles) => {
        if(err) console.error(err)
        if(!vehicles) console.error('No Vehicles?!')
        else{
            lastCheckState = now
            for(let v of vehicles){
                if(now - lastOnline > loElapsedLimit){
                    if(v.state !== 'online'){
                        lvd = tjx.lastVehicleDataAsync(voptions)
                        lastOnline = lvd.vehicle.vehicle_state.timestamp
                        console.log('offline %s %s', v.display_name, v.state)
                    } else {
                        tjx.vehicleData(voptions, (err, vehicle) =>{
                            if (err) console.error('vdata err: ', err)
                            else {
                                let vs = vehicle.vehicle_state
                                let ds = vehicle.drive_state

                                lastOnline = vehicle.vehicle_state.timestamp
                                //pollInterval = vs.is_user_present ? 60 : 10 * 60

                                console.log(`veh pol: %s online: shift: %s odometer %s user: %s near homelink: %s delta: %s`,
                                pollInterval, ds.shift_state, round(vs.odometer,2), vs.is_user_present, vs.homelink_nearby, vehicle.delta)
                            }
                        })
                    }
                }
                console.log(`vehicle: %s  state: %s now: %s LastOnline %s loElapsedMins: %s`,
                v.display_name, v.state, new Date(now).toLocaleString(),
                new Date(lastOnline).toLocaleString(), elapsedSC(lastOnline))
            }
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
