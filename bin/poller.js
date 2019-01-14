const EventEmitter = require('events')

class Poller extends EventEmitter {

    constructor(timeout = 100) {
        super()
        this.timeout = timeout
    }

    poll(newTimeout) {
        if(newTimeout!== undefined) this.timeout = newTimeout
        setTimeout(() => this.emit('poll'), this.timeout)
    }

    onPoll(cb) {
        this.on('poll', cb)
    }
}

module.exports = Poller
