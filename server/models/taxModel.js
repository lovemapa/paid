const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var taxModelSchema = new Schema({
    security: { type: Number },
    commission: { type: Number },
    tax: { type: Number },
    taxType: { type: String }

}, { timestamps: true })



module.exports = mongoose.model('tax', taxModelSchema);