var mongoose = require('mongoose');
var sequenceGenrator = require('mongoose-sequence-plugin');

var NoteSchema = mongoose.Schema({
	noteId		:	String,
	note		:	String,
	noteType	:	String,
	userId		:	String
});

NoteSchema.plugin(sequenceGenrator,{
	field	: 	'noteId',
	startAt	:	'001',
	prefix	:	'N-'
});

module.exports = NoteSchema;