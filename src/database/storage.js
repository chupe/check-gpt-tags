const mongoose = require('mongoose'),
    util = require('../common/util'),
    _ = require('lodash'),
    Publisher = require('./models/Publisher'),
    AdUnit = require('./models/AdUnit'),
    CustomError = require('./models/Error'),
    username = process.env.dbUser,
    password = process.env.dbPass,
    uri = `mongodb+srv://${username}:${password}@cluster0-ne8vt.mongodb.net/test`, //?retryWrites=true&w=majority
    options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        w: 'majority'
    }

async function updatePub(newObj) {
    let result

    if (newObj.error)
        return await storeError(newObj.error)


    async function update(newObj) {

        let doc = await Publisher.findOne({ name: newObj.name })

        if (!doc) doc = new Publisher()

        for (let prop in newObj) {
            if (Array.isArray(newObj[prop])) {
                if (prop === 'adstxtMissingLines') doc[prop] = []
                //Union of two arrays without repeating equal values and works with array within arrays
                //unlike some other methods
                doc[prop] = _.unionWith(doc[prop], newObj[prop], _.isEqual)
            } else {
                doc[prop] = newObj[prop]
            }
        }

        return doc.save()
    }

    if (Array.isArray(newObj)) {
        result = []
        for (let publisher of newObj) {
            result.push(await update(publisher))
        }
    } else {
        result = await update(newObj)
    }

    return result
}

async function updateAdunit(newObj) {
    let result

    async function update(adUnit) {
        let doc = await AdUnit.findOne({ name: adUnit.name })

        if (!doc) doc = new AdUnit()

        for (let prop in adUnit) {
            if (Array.isArray(adUnit[prop])) {
                for (let elem of adUnit[prop]) {
                    if (_.findIndex(doc[prop], (o) => _.isMatch(o, elem)) <= -1 && elem) // doc array contains elem and elem not null
                        doc[prop].push(elem)
                }
            } else {
                doc[prop] = adUnit[prop]
            }
        }

        return doc.save()
    }

    if (Array.isArray(newObj)) {
        result = []
        for (let adUnit of newObj) {
            result.push(await update(adUnit))
        }
    } else {
        result = await update(newObj)
    }

    return result
}

async function storeError(newObj) {
    let doc = new CustomError()

    for (let prop in newObj) {
        if (newObj[prop])
            doc[prop] = newObj[prop]
    }

    return doc.save()
}

async function getPub(queryObj) {
    return Publisher.findOne(queryObj)
}

async function getAdunit(queryObj) {
    return AdUnit.find(queryObj)
}

function connect() {
    return mongoose.connect(uri, options)
}

function disconnect() {
    return mongoose.disconnect()
}

function checkConnection() {
    return mongoose.connection.readyState
}

module.exports = {
    updatePub,
    getPub,
    updateAdunit,
    getAdunit,
    connect,
    disconnect,
    storeError,
    checkConnection
}