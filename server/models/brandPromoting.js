const mongoose = require('mongoose');
const constants = require('./../constant');

const Schema = mongoose.Schema;


var brandPromoting = new Schema({
    name: { type: String },
    date: Number
}, { timestamps: true })



module.exports = mongoose.model('brandPromoting', brandPromoting);