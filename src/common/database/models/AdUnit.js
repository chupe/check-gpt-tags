const mongoose = require('mongoose')

const AdUnitSchema = new mongoose.Schema({
    name: String,
    ID: String,
    sizes: { type: Array, default: [] },
    pageType: { type: Array, default: [] },
    inScript: Boolean,
    publisher: String,
    date: { type: Date, default: Date.now }
})

const AdUnit = mongoose.model('AdUnit', AdUnitSchema)

module.exports = AdUnit