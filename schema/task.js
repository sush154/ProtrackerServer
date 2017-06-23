var mongoose = require('mongoose');
var sequenceGenrator = require('mongoose-sequence-plugin');

var TaskSchema = mongoose.Schema({
	taskId			: String,
	taskSummary		: String,
	criticality		: String,
	description		: String,
	taskComments	: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
	taskStatus		: String,
	expectedComDate	: Date,
	completionDate	: Date,
	userId			: String,
	project			: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
	images			: [{type: String, ref: 'images'}]
});

TaskSchema.plugin(sequenceGenrator,{
	field	: 	'taskId',
	startAt	:	'001',
	prefix	:	'T-'
});

module.exports = TaskSchema;