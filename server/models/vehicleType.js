const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var vehicleTypeSchema = new Schema({
    type: { type: String },
    status: { type: Number, default: 1 },
}, { timestamps: true })



module.exports = mongoose.model('vehicleType', vehicleTypeSchema);