// @ts-check
const puppeteer = require('puppeteer'),
    gt = require('./gpt-access.js'),
    storage = require('../common/database/storage')

// let url = 'https://akos.ba/vijesti'

async function load(url) {

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

    await page.goto(url)

    await page.addScriptTag({ content: `${gt}` })

    let details = await page.evaluate(async () => {
        // @ts-ignore
        return injected()
    })

    await browser.close()

    // console.log(details)
    return details
}

module.exports = { load }