const tags = require('./check/tags'),
    script = require('./check/script'),
    storage = require('./common/database/storage'),
    util = require('./common/util'),
    _ = require('lodash')

let category = 'https://www.akos.ba/vijesti',
    article = 'https://akos.ba/potreba-za-afirmacijom-zelenog-dzihada/',
    home = new URL(category).origin,
    url = new URL(category)

console.log('started', url.host)

scriptCheck()
    .then((res) => {
        console.log(res)
        console.log('storing ended successfully')
        storage.disconnect()
    })
    .catch(e => {
        storage.storeError(util.errFmt(e))
            .then(res => console.log('ERROR:', res))
            .catch(e => console.log(util.errFmt(e)))
            .finally(() => storage.disconnect())
    })
    .finally(() => console.log('finished'))

async function scriptCheck() {

    await storage.connect()
    let pub = await storage.getPub({ name: 'akos.ba' })
    // console.log(pub)
    let res = await script.check(pub)

    return res
}

// store()
//     .then((res) => {
//         // console.log(res)
//         console.log('storing ended successfully')
//         storage.disconnect()
//     })
//     .catch(e => {
//         console.log(e)
//         storage.storeError(e)
//             .catch(e => console.log(e))
//             .finally(() => storage.disconnect())
//     })
//     .finally(() => console.log('finished'))

async function store() {
    await storage.connect()
    let results = await Promise.all([
        tags.load(home),
        tags.loadMobile(home),
        tags.load(article),
        tags.loadMobile(article),
        tags.load(category),
        tags.loadMobile(category)
    ])

    let toAwait = []
    for (let result of results) {
        let array = _.values(result.adUnits)
        toAwait.push(await storage.updateAdunit(array))
        toAwait.push(await storage.updatePub(result))
    }

    return toAwait
}