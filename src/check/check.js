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
    }

    return toAwait
}

async function start(url) {
    try {
        await store(url)
        if (['/', ''].includes(url.pathname))
            adstxt(url)
                .then(() => console.log('Ads.txt for ' + url.hostname + ' has been checked'))
                .catch(e => console.log(e))
    } catch (e) {
        try {
            await storage.storeError(util.errFmt(e))
            console.log('ERROR (stored):', util.errFmt(e))
        } catch (e) {
            console.log('ERROR:', util.errFmt(e))
        }
    }
}

module.exports = {
    start
}