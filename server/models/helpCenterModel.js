const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var helpCenterModelSchema = new Schema({
    image: { type: String },
    description: { type: String },
    userId: { type: Schema.ObjectId, ref: 'user' }

}, { timestamps: true })

module.exports = mongoose.model('helpCenter', helpCenterModelSchema);