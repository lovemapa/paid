const mongoose = require('mongoose');
const constants = require('./../constant');

const Schema = mongoose.Schema;


var discountCouponModelSchema = new Schema({
    name: { type: String, required: true },
    discountType: { type: Number, required: true, enum: constants.DISCOUNT_TYPE_ARR, default: constants.DISCOUNT_TYPE.PERCENTAGE },
    discountAmount: { type: Number, required: true },
    maxDiscount: { type: Number, required: false },
    minAmountForDiscount: { type: Number, required: true },
    applicableTimeStartHours: { type: Number, required: false },
    applicableTimeStartMinutes: { type: Number, required: false },
    applicableTimeEndHours: { type: Number, required: false },
    applicableTimeEndMinutes: { type: Number, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    couponCode: { type: String, required: false, unique: true }
}, { timestamps: true })



module.exports = mongoose.model('discountCoupon', discountCouponModelSchema);