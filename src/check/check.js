const tags = require('./tags'),
    script = require('./script'),
    storage = require('../common/database/storage'),
    adstxt = require('./adstxt'),
    util = require('../common/util'),
    _ = require('lodash')

async function store(url) {
    let results

    if (Array.isArray(url)) {
        for (let u of url) {
            results = await Promise.all([
                tags.load(u.href),
                tags.loadMobile(u.href),
            ])
        }
    } else {
        results = await Promise.all([
            tags.load(url.href),
            tags.loadMobile(url.href),
        ])
    }

    let toAwait = []
    for (let result of results) {
        let array = _.values(result.adUnits)
        toAwait.push(await storage.updateAdunit(array))
        toAwait.push(await storage.updatePub(result))
        toAwait.push(await adstxt(url.href))
    }

    return toAwait
}

// process.on('uncaughtException', function (err) {
//     console.log(err)
// })
// storage.connect().then(async () => {

//     await store(new URL('https://kukuklok.com'))

//     console.log('finished')

// })

module.exports = {
    store
}