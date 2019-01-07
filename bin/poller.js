/** 
 *  Poller
 */
const EventEmitter = require('events')

class Poller extends EventEmitter {
    /**
     * @param {int} timeout how long should we wait after the poll started?
     */
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
