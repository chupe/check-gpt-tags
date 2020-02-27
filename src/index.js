const util = require('./common/util'),
    queue = require('./common/queue')

console.log('STARTED')

init()

async function init() {
    let urls = await util.getUrls()
    urls = urls.slice(0, 9)
    // let url = util.sanitizeUrl('akos.ba')
    // urls = [url]

    queue.addToQs(urls)
}