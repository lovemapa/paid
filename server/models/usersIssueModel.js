const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var userIssueModelSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'user' },
    screenshot: { type: String, },
    issue: { type: String }

}, { timestamps: true })



module.exports = mongoose.model('userIssue', userIssueModelSchema);