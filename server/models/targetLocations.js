const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var targetSchema = new Schema({
    name: String,
    campaignId: { type: Schema.Types.ObjectId, ref: 'campaign', required: true },
    lat: Number,
    long: Number,
    location: {
        type: {
            type: String, default: "Point"
        },

        coordinates: [Number]
    }
}, { timestamps: true })



module.exports = mongoose.model('targetlocation', targetSchema);