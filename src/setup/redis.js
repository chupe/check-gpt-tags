const child = require('child_process'),
    spawn = child.spawn

let redis = spawn('redis-server'),
    pid = redis.pid

function init() {
    console.log('redis-server running at the default port')
}

function status() {
    return redis.connected
}

function close() {
    return process.kill(pid)
}

module.exports = {
    init,
    close,
    status
}