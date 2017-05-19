var mongoose = require('mongoose');

var clientSchema = require('../schema/client');

var ClientModel = mongoose.model('client', clientSchema);

module.exports = ClientModel;