const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var carCategorySchema = new Schema({
    carType: { type: String, },
    baseFare: { type: Number },
    hourlyMinRate: { type: Number },
    hourlyMaxRate: { type: Number },
    dayMinRate: { type: Number },
    dayMaxRate: { type: Number },
    image: { type: String },
    date: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('carCategory', carCategorySchema);