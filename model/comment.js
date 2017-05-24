var mongoose = require('mongoose');

var commentSchema = require('../schema/comment');

var CommentModel = mongoose.model('comment', commentSchema);

module.exports = CommentModel;