const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var securityModelSchema = new Schema({
    name: { type: String },
    price: { type: Number },
}, { timestamps: true })



module.exports = mongoose.model('security', securityModelSchema);