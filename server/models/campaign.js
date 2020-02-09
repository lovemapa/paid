const mongoose = require('mongoose');
const constants = require('./../constant');

const Schema = mongoose.Schema;


var campaignModelSchema = new Schema({
    companyId: { type: Schema.ObjectId, ref: 'company' },
    name: { type: String, required: true },
    awareness: { type: String },
    consideration: { type: Number },// 1 for CPC , // 2 for CPE
    acquisition: { type: Number }, // 1 for CPA , 2 for CPI
    brandPromoting: { type: String },
    dateForContentLive: { type: Number },
    genderType: { type: String },
    ageGroups: [{ type: Number }],
    creatorNiche: [{ type: String }],
    targetLocation: { type: String },
    targetLanguage: [{ type: String, enum: ['English', 'Spanish', 'French'], default: 'English' }],
    followingSize: { type: Number, default: 2 },
    contentsFormat: [{ type: String, enum: ['Stories', 'Photos', 'Videos', 'Carousels'] }],
    campaignBudget: Number,
    organicPost: Number,
    whiteListBudget: Number,
    requirement: String,
    content: String,
    hashtag: [String]



}, { timestamps: true })



module.exports = mongoose.model('campaign', campaignModelSchema);