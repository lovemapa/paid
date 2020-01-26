const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var vehicleRatingModelSchema = new Schema({
    vehicleId: { type: Schema.ObjectId, ref: 'vehicle' },
    ownerId: { type: Schema.ObjectId, ref: 'owner' },
    userId: { type: Schema.ObjectId, ref: 'user' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'booking' },
    rating: { type: Number },
    feedback: { type: String, default: '' }

}, { timestamps: true })



module.exports = mongoose.model('vehicleRating', vehicleRatingModelSchema);