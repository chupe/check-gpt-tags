const tags = require('./tags.js'),
    newObj = require('../common/database/newObj.json')

jest.setTimeout(15000)

let json = newObj.adUnits,
    propertiesToCheck = ['ID', 'name', 'sizes']

json = Object.assign({}, json)

for (let adUnit in json) {
    for (let prop in json[adUnit]) {
        if (propertiesToCheck.includes(prop)) {
            continue
        } else {
            delete json[adUnit][prop]
        }

    }
    // console.log(json[adUnit])
}


test('get ad units using googletag.pubads() (homepage)', async () => {
    let jsonHomepage = Object.assign({}, json)
    for (let adUnit in jsonHomepage) {
        jsonHomepage[adUnit].pageType = ['homepage']
    }
    expect((await tags.load('https://akos.ba')).adUnits).toEqual(jsonHomepage)
})

test('get ad units using googletag.pubads() (article)', async () => {
    let jsonArticle = Object.assign({}, json)
    for (let adUnit in jsonArticle) {
        jsonArticle[adUnit].pageType = ['article']
    }
    expect((await tags.load('https://akos.ba/allah-voli-onoga-ko-radi-i-trudi-se-da-prehrani-porodicu/'))['akos.ba'].adUnits).toEqual(jsonArticle)
})

test('get ad units using googletag.pubads() (category)', async () => {
    let jsonCategory = Object.assign({}, json)
    for (let adUnit in jsonCategory) {
        jsonCategory[adUnit].pageType = ['category']
    }
    expect((await tags.load('https://akos.ba/vijesti'))['akos.ba'].adUnits).toEqual(jsonCategory)
})
