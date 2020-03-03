module.exports = function setup() {
    redis.init()
}

// @ts-ignore
const auth = require('../config.json'),
    redis = require('./redis')
process.env.dbUser = process.env.dbUser || auth.dbUser
process.env.dbPass = process.env.dbPass || auth.dbPass
process.title = 'chupe-analytics'

const storage = require('../database/storage')
process.setUncaughtExceptionCaptureCallback(async err => {
    console.log('Error that shook the world!\n', err)
    await storage.disconnect()
    redis.close()
})
