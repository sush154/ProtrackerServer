var mongoose = require('mongoose');

var userSchema = require('../schema/user');

var UserModule = mongoose.model('UserModel', userSchema, 'user');

module.exports = UserModule;