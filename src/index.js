const tags = require('./check/tags').load,
    storage = require('./common/database/storage');


let url = 'https://www.atvbl.com/'

try {
    store().catch(e => console.log(e))
} catch (e) {
    console.log('Error: ' + e)
} finally {
    storage.disconnect()
}

async function store() {
    let res = await tags(url)
    console.log(res)

    await storage.connect()
    for (let adUnit in res.adUnits) {
        storage.updateAdunit(res.adUnits[adUnit])
    }
    storage.updatePub(res)

    return true
}