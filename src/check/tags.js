// @ts-check
const puppeteer = require('puppeteer'),
    gt = require('./gpt-access.js'),
    util = require('../common/util')

async function loadMobile(url) {
    const iPhone = puppeteer.devices['iPhone 7']
    return load(url, iPhone)
}

async function load(url, device) {

    try {
        const browser = await puppeteer.launch({
            // devtools: true,
        });
        const pagesArray = await browser.pages()
        const page = pagesArray[0]

        await page.setRequestInterception(true)

        page.on('request', (req) => {
            if (req.resourceType() == 'font' || req.resourceType() == 'image') {
                req.abort()
            }
            else {
                req.continue()
            }
        })

        if (device) await page.emulate(device)
        await page.goto(url)

        await page.addScriptTag({ content: `${gt}` })

        let details = await page.evaluate(() => {
            // @ts-ignore
            return injected()
        })

        await browser.close()

        return details

    } catch (e) {

        return {
            error: {
                message: JSON.stringify(e.message),
                requestedUrl: url,
                publisher: util.sanitizeUrl(url).hostname
            }
        }
    }
}

module.exports = {
    load,
    loadMobile
}