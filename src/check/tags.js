// @ts-check
const puppeteer = require('puppeteer'),
    gt = require('./gpt-access.js'),
    storage = require('../common/database/storage')

async function loadMobile(url) {
    const iPhone = puppeteer.devices['iPhone 7']
    return load(url, iPhone)
}

async function load(url, device) {

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

    let details = await page.evaluate(async () => {
        // @ts-ignore
        return injected()
    })

    await browser.close()

    console.log(details.name,  details.pageType)
    return details
}

module.exports = {
    load,
    loadMobile
}