const mongoose = require('mongoose')

const PublisherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    adstxtCheck: Boolean,
    adstxtMissingLines: { type: Array, default: [] },
    pageType: { type: Array, default: [] },
    scripts: { type: Array, default: [] },
    unusedBids: { type: Array, default: [] },
    date: { type: Date, default: Date.now }
})

const Publisher = mongoose.model('Publisher', PublisherSchema)

module.exports = Publisher