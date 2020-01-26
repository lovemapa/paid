const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var messageSchema = new Schema({
    ownerId: { type: Schema.ObjectId, ref: 'owner' },
    userId: { type: Schema.ObjectId, ref: 'user' },
    bookingId: { type: Schema.ObjectId, ref: 'booking' },
    senderId: { type: String },
    message: { type: String },
    date: { type: Number },
    read: { type: Boolean, default: false } 
}, { timestamps: true })



module.exports = mongoose.model('message', messageSchema);