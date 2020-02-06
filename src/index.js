const check = require('./check/check'),
    storage = require('./common/database/storage'),
    util = require('./common/util'),
    _ = require('lodash'),
    fs = require('fs'),
    mongoose = require('mongoose')

// let category = new URL('https://akos.ba/vijesti'),
//     article = new URL('https://akos.ba/potreba-za-afirmacijom-zelenog-dzihada/')
let category = new URL('https://a2news.com/sport'),
    article = new URL('https://a2news.com/2020/02/04/basha-takohet-me-aleatet-per-nje-formule-te-re-per-koalicionet')

console.log('STARTED', category.host)

iteratePubs()

async function iteratePubs() {
    await storage.connect()
    let txt = fs
        .readFileSync('/home/chupe/Lupon Media/development/check-gpt-tags/src/tabela.txt')
        .toString()

    let arr = txt.split('\n')
    let publishers = []
    for (let line of arr) {
        publishers.push(line.split('\t')[0])
    }
    try {
        let test = publishers.slice(3, 5)
        for (let pub of test) {
            console.log(pub)
            pub = _.trim(pub, 'w')
            console.log(pub)
            await start(new URL('https://' + pub))
        }
        // await storage.disconnect()
    } catch (e) {
        console.log('ERROR CLOSING SERVER:', e)
    }
}

async function start(url) {

    try {
        await check.store(url)
        console.log('STORING FINISHED')
        check.scriptCheck(url)
        console.log('SCRIPT CHECK FINISHED')
    } catch (e) {
        try {
            await storage.storeError(e)
            console.log('ERROR (stored):', util.errFmt(e))
        } catch (e) {
            console.log('ERROR:', util.errFmt(e))
        }
    }
}