//@ts-nocheck

const _ = require('lodash'),
    util = require('../common/util'),
    storage = require('../common/database/storage')

async function check(publisher) {
    let result = []

    if (Array.isArray(publisher)) {
        for (let pub of publisher) {
            result.push(checkSingle(pub))
        }
    } else if (publisher) {
        result.push(checkSingle(publisher))
    } else console.log(publisher, 'ERROR, invalid publisher')

    async function checkSingle(publisher) {

        let adUnit = await storage.getAdunit({ publisher: publisher.name })

        for (let url of publisher.scripts) {
            let script

            try {
                script = await util.fetchFromUrl(url)
                for (let unit of adUnit) {
                    let reg = new RegExp(unit.ID)
                    let scriptTag = script.match(reg)
                    if (scriptTag && scriptTag.length > 0) {
                        unit.inScript = true
                        result.push(await unit.save())
                    } else {
                        unit.inScript = false
                        result.push(await unit.save())
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    return Promise.all(result)
}

module.exports = {
    check
}