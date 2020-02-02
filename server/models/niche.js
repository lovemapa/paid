const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var nicheModelSchema = new Schema({

    name: { type: String },

})



module.exports = mongoose.model('niche', nicheModelSchema);