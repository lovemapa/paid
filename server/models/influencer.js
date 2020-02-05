const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var influencerModelSchema = new Schema({
    contact: { type: String, default: '' },
    email: { type: String, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    password: { type: String },
    gender: { type: String },
    date: { type: Number },
    dob: { type: Number },
    facebookId: { type: String },
    youtubeId: { type: String },
    instagramId: { type: String },
    primaryCategory: { type: String },
    secondaryCategory: [{ type: String }],
    isDeleted: { type: Number, default: 0 },
    token: { type: String }

}, { timestamps: true })

module.exports = mongoose.model('influencer', influencerModelSchema);

