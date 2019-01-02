const fs = require('fs'),
    tjs = require('teslajs')

if (process.argv.length < 4) {
    console.log('node login username passsword')
    process.exit(1)
}

var username = process.argv[2]
var password = process.argv[3]

tjs.loginAsync(username, password).done( result => {
        if (!result.authToken) {
            console.error("Login failed!")
            process.exit(1)
        }
        var token = JSON.stringify(result.body)
        if (token) {
            fs.writeFileSync('../data/.token', token)
            console.log('Auth token saved ../data/.token!', result.authToken)

            tjs.vehicles({ authToken: result.authToken }, function (err, vehicles) {
                console.log('Veh Data:', err, vehicles)
                if (!err) {
                    fs.writeFileSync('../data/.vehicles.json', JSON.stringify(vehicles))
                    //for (var vehicle in vehicles)
                    //    console.log("\nVehicle " + vehicle.vin + " - " + tjs.getModel(vehicle) + " ( '" + vehicle.display_name + "' ) is: " + vehicle.state)
                    console.log(vehicles)

                    var vehicle = vehicles[0]
                    var options = {
                        authToken: result.authToken,
                        vehicleID : vehicle.id_s,
                        vehicle_id : vehicle.vehicle_id,
                        tokens : vehicle.tokens
                    }
        

                    fs.writeFileSync('../data/vtoken.json', JSON.stringify(options))
                }
            })
        }
    }, error => {
        console.error(error)
    }
)
