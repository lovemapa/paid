const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var eventModelSchema = new Schema({
    eventId: { type: Number },
    eventType: { type: String },
    eventTypeInLowerCase: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })



module.exports = mongoose.model('event', eventModelSchema);

