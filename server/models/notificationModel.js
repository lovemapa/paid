const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var notificationModelSchema = new Schema({
    assignedId: { type: String },
    title: { type: String },
    description: { type: String },
    status: { type: Number, default: 1 }, // 0 (offline)  1 (online)
    typeId: { type: String },
    type: { type: String }
}, { timestamps: true })



module.exports = mongoose.model('notification', notificationModelSchema);

