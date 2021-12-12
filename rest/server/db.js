const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postDBSchema = new Schema({
    content: String
});

const PostDBModel = mongoose.model('PostDBModel', postDBSchema);

module.exports = PostDBModel;