const util = require('./util'),
    fs = require('fs')

test('fetch url', async () => {
    let file = fs.readFileSync(__dirname + '/ads.txt').toString().split('\n')
    let remote = await util.fetchFromUrl('https://akos.ba/ads.txt')

    let array = remote.split('\n')
    array.shift().toString()

    expect(array).toEqual(file)
})

test('has own properties', () => {
    expect(util.hasProperties({name: 'any'})).toBe(true)
})

test('is iterable', () => {
    expect(util.isIterable([])).toBe(true)
})