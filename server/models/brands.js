const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var brandSchema = new Schema({
    name: String
}, { timestamps: true })



module.exports = mongoose.model('brands', brandSchema);