const check = require('../check/check'),
    storage = require('../common/database/storage')

module.exports = async function (job) {
    let url = new URL(job.data.url)

    if (storage.checkConnection() !== 1) await storage.connect()

    await check.start(url)
    
    return true
}