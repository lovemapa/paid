const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var promoCodeModelSchema = new Schema({
    name: { type: String },
    type: { type: String },
    code: { type: String },
    value: { type: Number },
    member: { type: Number },
    startTime: { type: Number },
    endTime: { type: Number },
}, { timestamps: true })



module.exports = mongoose.model('promoCode', promoCodeModelSchema);

