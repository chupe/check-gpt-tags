const tags = require('./tags'),
    script = require('./script'),
    storage = require('../common/database/storage'),
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
    }

    return toAwait
}

async function scriptCheck(url) {
    let pub = await storage.getPub({ name: url.hostname }),
        res
    res = await script.check(pub)

    return res
}

module.exports = {
    scriptCheck,
    store
}