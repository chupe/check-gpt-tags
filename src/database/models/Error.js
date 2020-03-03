const mongoose = require('mongoose')

const ErrorSchema = new mongoose.Schema({
    driver: { type: Boolean },
    name: { type: String },
    index: { type: Number },
    code: { type: Number },
    keyPattern: { type: Object },
    keyValue: { type: Object },
    errmsg: { type: String },
    message: { type: String },
    publisher: { type: String },
    requestedUrl: { type: String },
    date: { type: Date, default: Date.now }
})

const AdUnit = mongoose.model('Error', ErrorSchema)

module.exports = AdUnit