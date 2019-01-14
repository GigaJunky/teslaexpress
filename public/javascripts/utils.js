

var wakeUpTimmer = null

function bodyOnload()
{
  console.log('bodyOnload')
}

function bodyOnloadX()
{
  console.log('bodyOnload')
  wakeUpStatus()
  setTimeout(() => { wakeUpTimmerClear() }, 5 * 60000)
  wakeUpTimmerStart()
}

function wakeUpStatus() {
  ajax('/wakeup', (result) => {
    console.log('wakeUp Status', result.err, 'state: ', result.result.state, 'timmer: ', wakeUpTimmer, new Date().toLocaleString())
    var msg =  result.err !== null ? result.err : result.result.state
    setAllHTMLText('.vstate', msg + ', ' + new Date().toLocaleString())
  })
}

function wakeUpTimmerStart(){
  console.log('Wake Up Timmer Started: ', wakeUpTimmer, new Date().toLocaleString())
  if(!wakeUpTimmer)
  wakeUpTimmer = setInterval(() => { wakeUpStatus() }, 30000)
  console.log('Wake Up Timmer: ', wakeUpTimmer)
}

function wakeUpTimmerClear() {
   clearInterval(wakeUpTimmer)
   console.log('wakeUp Timmer Cleared: ', wakeUpTimmer, new Date().toLocaleString())
   setAllHTMLText('.vstate', 'Wake Up Timmer Cleared, ' + new Date().toLocaleString())
}

function setAllHTMLText(className, text) {
  var vstates = document.querySelectorAll(className)
  for (var i = 0; i < vstates.length; ++i)
    vstates[i].innerHTML = text
}

function setChargeLimit(){
  var ChargeLimit =  + document.getElementById('chargeLimit').value
  console.log('set Charge Limit: ', ChargeLimit)
  teslaCmd('setChargeLimit/' + ChargeLimit)
}


function teslaCmd(cmd) {
  ajax(cmd, (res) => {

    console.log('Tesla Command: ', cmd, res)
    var msg =  res.err !== null ? res.err : res.result

    if (res.err) {
      document.getElementById("message").innerHTML = cmd + ' error: ' + msg.err
      return
    }

    switch (cmd.toLowerCase()) {
      case 'wakeup': wakeUpStatus();  break
      default: 
      console.log('cmd: ', cmd, res.err, msg )
      
      document.getElementById("message").innerHTML = msg.reason
    }
  })
}

function ajax(cmd, cb) {
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
      if (cb) cb(JSON.parse(this.responseText))
  }
  xhttp.open("GET", cmd, true)
  xhttp.send()
}
