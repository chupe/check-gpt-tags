const mongoose = require('mongoose')

const AdUnitSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    ID: { type: String, required: true },
    sizes: { type: Array, default: [] },
    pageType: { type: Array, default: [] },
    prebid: Boolean,
    bids: { type: Array, default: [] },
    bids_mobile: { type: Array, default: [] },
    pbSizes_mobile: { type: Array, default: [] },
    pbSizes: { type: Array, default: [] },
    labels: { type: Array, default: [] },
    publisher: { type: String, required: true },
    date: { type: Date, default: Date.now }
})

const AdUnit = mongoose.model('AdUnit', AdUnitSchema)

module.exports = AdUnit