// @ts-ignore
const setup = require('./setup/setup'),
    util = require('./common/util'),
    queue = require('./queue/queue'),
    storage = require('./database/storage'),
    redis = require('./setup/redis')

init()
console.log('STARTED')
console.time('all')

async function init() {
    setup()
    let urls = await util.getUrls()
    urls = urls.slice(0, 9)
    let url = util.sanitizeUrl('akos.ba')
    urls = [url]
    console.log('Number of URLs to be processed: ' + urls.length)

    await queue.processUrls(urls)

    console.log('Finished')
    console.timeEnd('all')
    process.exit()
}
