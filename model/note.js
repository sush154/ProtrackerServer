var mongoose = require('mongoose');

var NoteSchema = require('../schema/note');

var NoteModel = mongoose.model('note', NoteSchema);

module.exports = NoteModel;