const Queue = require('bull'),
    storage = require('./database/storage')

async function addToQs(jobs) {
    console.time('all')
    await storage.connect()

    let siteCheckQ = new Queue('site check queue')
    siteCheckQ.process(5, '/home/chupe/Lupon Media/development/check-gpt-tags/src/common/siteCheckProcessor.js')

    for (let url of jobs) {
        siteCheckQ.add({ url })
    }

    siteCheckQ.on('completed', (job, result) =>
        console.log('Storing finished for ' + job.data.url)
    )

    siteCheckQ.on('drained', async () => {
        await siteCheckQ.whenCurrentJobsFinished()
        await storage.disconnect()

        siteCheckQ.close()

        console.timeEnd('all')
    })
}

module.exports = { addToQs }