var mongoose = require('mongoose');
var sequenceGenrator = require('mongoose-sequence-plugin');

var CommentSchema = mongoose.Schema({
	commentId 		: String,
	comment			: String
});

CommentSchema.plugin(sequenceGenrator,{
	field	:	'commentId',
	startAt	:	'001',
	prefix	:	'CM-'
});

module.exports = CommentSchema;