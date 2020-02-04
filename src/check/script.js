//@ts-nocheck

const _ = require('lodash'),
    util = require('../common/util'),
    storage = require('../common/database/storage')

async function check(publisher) {
    
    let adUnit = await storage.getAdunit({ publisher: publisher.name }),
    result = []
    
    for (let url of publisher.scripts) {
        let script

        try {
            script = await util.fetchFromUrl(url)
        } catch (e) {
            console.log(e)
        }
        for (let unit of adUnit) {
            let reg = new RegExp(unit.ID)
            let scriptTag = script.match(reg)
            if (scriptTag && scriptTag.length > 0) {
                console.log('here we are', scriptTag[0])
                unit.inScript = true
                result.push(unit.save())
            } else {
                unit.inScript = false
                result.push(unit.save())
            }
        }
    }

    return await Promise.all(result)
}

module.exports = {
    check
}