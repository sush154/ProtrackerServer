var mongoose = require('mongoose'),
	config = require('./config');

mongoose.connect(config.mongo.connectionUrl);
var db = mongoose.connection;

db.once('open', function(){
	console.log("db is connected");
});

module.exports = db;