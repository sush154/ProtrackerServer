var mongoose = require('mongoose');

var userSchema = require('../schema/user');

var UserModule = mongoose.model('user', userSchema);

module.exports = UserModule;