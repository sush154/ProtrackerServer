var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	firstName : String,
	lastName: 	String,
	email : 	String,
	password:	String
});

module.exports = userSchema;