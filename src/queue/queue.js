const Queue = require('bull'),
    storage = require('../database/storage'),
    redis = require('../setup/redis')

async function processUrls(jobs) {
    return new Promise(async (res, rej) => {
        await storage.connect()

        let siteCheckQ = new Queue('site check queue')
        siteCheckQ.process(5, process.cwd() + '/src/queue/siteCheckProcessor.js')

        for (let url of jobs) {
            siteCheckQ.add({ url })
        }

        siteCheckQ.on('completed', async (job, result) => {
            if (!(await job.isFailed()))
                console.log('Storing finished for ' + job.data.url)
        })


        siteCheckQ.on('drained', async () => {
            await siteCheckQ.whenCurrentJobsFinished()
            await storage.disconnect()

            redis.close()
            await siteCheckQ.close()

            res(true)
        })
    })
}

module.exports = { processUrls }