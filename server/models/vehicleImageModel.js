const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var vehicleImageModelSchema = new Schema({
    path: { type: String },
    type: { type: String, default: '' },
    vehcileId: { type: Schema.ObjectId, ref: 'vehicle' },
    date: { type: Number }

}, { timestamps: true })



module.exports = mongoose.model('vehicleImage', vehicleImageModelSchema);