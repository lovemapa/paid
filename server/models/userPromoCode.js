const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var userPromoCodeModelSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'user' },
    promoId: { type: Schema.ObjectId, ref: 'promoCode' }

}, { timestamps: true })



module.exports = mongoose.model('userPromoCode', userPromoCodeModelSchema);