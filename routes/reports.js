const
fs = require('fs')
  , express = require('express')
  , router = express.Router()
  , dataPath = __dirname + '/../data/'
  , vdataFN = dataPath + 'vdata.json'


router.get('/vehicleData/:id', function (req, res, next) {
    let fn = dataPath + 'vdata' + req.params.id + '.json'
    let d = JSON.parse(fs.readFileSync(fn))
    res.render('vdata', { title: 'Tesla Vehicle Data Report ' + new Date(parseInt(req.params.id)).toLocaleString(), vdata: d, id: req.params.id })  
})

router.get('/vdelta/:id', (req, res) => {
    let fn = dataPath + 'vdelta' + req.params.id + '.json'
    let d = JSON.parse(fs.readFileSync(fn))
    res.render('vdata', { title: 'Tesla Vehicle Delta Data Report ' + new Date(parseInt(req.params.id)).toLocaleString(), vdata: d, id: req.params.id })  
})


router.get('/', function (req, res, next) {
    fs.readdir(dataPath, (err, files) => {
        let ff = files.filter(o=> o.length === 23).map((f, i) => {
            let fd = f.match(/\d+/g)
            let fdn = fd ? parseInt( fd[0]) : 0

            let fn1 = dataPath + f
            let s = JSON.parse(fs.readFileSync(fn1))
            d = s.drive_state,
            c = s.charge_state
            v = s.vehicle_state
            return { id: fdn, date: new Date(fdn).toLocaleString(), fn: f,
                 odometer: round(v.odometer, 1),
                 shift:    d.shift_state,
                 latitude: d.latitude,
                 longitude:d.longitude,
                 distHome: round(distFromHome(d.latitude, d.longitude), 2),
                 energy_added : c.charge_energy_added,
                 battery_level: c.battery_level
                } 
        })
        console.log(ff)
        res.render('files', { title: 'Tesla Vehicle File list Report ', files: ff, err: err })  
    })
})

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function distFromHome(lat, lon)
{
    const lat1 = 41.715943, lon1 = -88.013895
    return distance(lat1,lon1, lat, lon, 'M')
}

//https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

module.exports = router