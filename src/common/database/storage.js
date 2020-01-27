const mongoose = require('mongoose'),
    util = require('../util'),
    _ = require('lodash'),
    auth = require('./auth'),
    Publisher = require('./models/Publisher'),
    AdUnit = require('./models/AdUnit'),
    uri = `mongodb+srv://${auth.username}:${auth.password}@cluster0-ne8vt.mongodb.net/test`, //?retryWrites=true&w=majority
    options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        retryWrites: true,
        w: 'majority'
    }

async function updatePub(newObj) {
    let result

    let doc = await Publisher.findOne({ name: newObj.name })

    if (!doc) doc = new Publisher()

    for (let prop in newObj) {
        if (Array.isArray(newObj[prop])) {
            //Union of two arrays without repeating equal values and works with array within arrays
            //unlike some other methods
            doc[prop] = _.unionWith(doc[prop], newObj[prop], _.isEqual)
        } else {
            doc[prop] = newObj[prop]
        }
    }

    result = await doc.save()
    return result
}

async function updateAdunit(newObj) {
    let result, doc

    async function update(adUnit) {
        doc = await AdUnit.findOne({ name: adUnit.name })

        if (!doc) doc = new AdUnit()

        for (let prop in newObj) {
            if (Array.isArray(newObj[prop])) {
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
        for (let adUnit of newObj) {
            result.push(await update(adUnit))
        }
    } else {
        result = await update(newObj)
    }

    return result
}

// For testing purposes
// (async () => {
//     let doc = await updateAdunit(newObj.adUnits['-turkish.airlines-'])
//     console.log(doc)
// })()

async function getPub(queryObj) {
    let result = await Publisher.findOne({ queryObj })

    return result
}

async function getAdunit(queryObj) {
    let result = await AdUnit.find({ queryObj })

    return result
}

async function connect() {
    await mongoose.connect(uri, options)
}

async function disconnect() {
    await mongoose.disconnect()
}

module.exports = {
    updatePub,
    getPub,
    updateAdunit,
    getAdunit,
    connect,
    disconnect
}