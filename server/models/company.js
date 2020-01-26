const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var companyModelSchema = new Schema({
    contact: { type: String, default: '' },
    email: { type: String },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    password: { type: String },
    date: { type: Number },
    companyName: { type: String },
    profilePic: { type: String, default: '/default.png' },
    isDeleted: { type: Number, default: 0 },
    token: { type: String }

}, { timestamps: true })

module.exports = mongoose.model('user', companyModelSchema);

