const check = require('./check/check'),
    storage = require('./common/database/storage'),
    util = require('./common/util'),
    _ = require('lodash'),
    fs = require('fs'),
    adstxt = require('./check/adstxt')

console.log('STARTED')

init()

async function init() {

    let urls = await util.getUrls()

    try {
        await storage.connect()

        for (let url of urls) {
            console.log('Making checks for ' + url.hostname + url.pathname)
            try {
                await check.start(url)
                if (url.pathname === '/') adstxt
            } catch (e) {
                console.log(e)
                continue
            }
        }
        await storage.disconnect()
    } catch (e) {
        console.log('ERROR CLOSING SERVER:', util.errFmt(e))
    }
}