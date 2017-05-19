var mongoose = require('mongoose');
var sequenceGenrator = require('mongoose-sequence-plugin');

var ClientSchema = mongoose.Schema({
	clientId		:	String,
	clientName		:	String,
	clientDomain	:	String,
	description		:	String,
	userId			:	String
});

ClientSchema.plugin(sequenceGenrator,{
	field	:	'clientId',
	startAt	:	'001',
	prefix	:	'C-'
});

module.exports = ClientSchema;
