const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let blockSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'company' },// Blocking User
    opponentId: { type: Schema.Types.ObjectId, ref: 'company' },// Blocked user
});



let block = mongoose.model("block", blockSchema);

module.exports = block;
