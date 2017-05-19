var mongoose = require('mongoose');
var sequenceGenrator = require('mongoose-sequence-plugin');

var projectSchema = mongoose.Schema({
	projectId		:	String,
	projectName		:	String,
	clientId		:	String,
	clientName		:	String,
	description		:	String,
	userId			:	String
});

projectSchema.plugin(sequenceGenrator,{
	field	: 	'projectId',
	startAt	:	'001',
	prefix	:	'P-'
});

module.exports = projectSchema;

