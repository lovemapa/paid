const mongoose = require('mongoose');
const constants = require('./../constant');

const Schema = mongoose.Schema;


var bookingModelSchema = new Schema({
    bookingDuration: { type: Number },
    vehicleId: { type: Schema.ObjectId, ref: 'vehicle' },
    ownerId: { type: Schema.ObjectId, ref: 'owner' },
    typeOfEvent: { type: String },
    address: { type: String, default: ''},
    startTime: { type: Number },
    endTime: { type: Number },
    currentCoordinates: [{ type: Number }],
    location: {
        type: {
            type: String, default: "Point"
        },
        coordinates: [Number]
    },
    currentLat: { type: Number },
    currentLong: { type: Number },
    userId: { type: Schema.ObjectId, ref: 'user' },
    trackImage: { type: String },
    status: { type: Number, enum: constants.BOOKING_STATUS_ARR, default: constants.BOOKING_STATUS.PENDING },
    isPaid: { type: Boolean, default: false },
    date: { type: Number },
    price: { type: Number, default: ''},
    tax: { type: Number, default: '' },
    commission: { type: Number, default: '' },
    security: { type: Number, default: '' },
    promoCode: { type: String },
    estimatedPrice: { type: Number },
    reason: { type: String } 
}, { timestamps: true })



module.exports = mongoose.model('booking', bookingModelSchema);