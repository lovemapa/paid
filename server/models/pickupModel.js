const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var pickDetailsModelSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: 'booking' },
    date: { type: Number },
    name: { type: String },
    contact: { type: String },
    notes: { type: String },
    specialRequest: { type: String },
    // userId: { type: Schema.Types.ObjectId, ref: 'user' },

}, { timestamps: true })



module.exports = mongoose.model('pickDetails', pickDetailsModelSchema);

