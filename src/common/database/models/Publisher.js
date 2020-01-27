const mongoose = require('mongoose'),
    AdUnit = require('./AdUnit')

const PublisherSchema = mongoose.Schema({
    name: String,
    adstxtCheck: Boolean,
    adstxtMissingLines: { type: Array, default: [] },
    pageType: { type: Array, default: [] },
    scripts: { type: Array, default: [] },
    date: { type: Date, default: Date.now }
})

const Publisher = mongoose.model('Publisher', PublisherSchema)

module.exports = Publisher