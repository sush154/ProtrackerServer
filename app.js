var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	connection = require('./connection');

var loginMiddlware = require('./router/login/router');
var registerMiddleware = require('./router/register/router');
var projectMiddleware = require('./router/project/router');

app.use(bodyParser.json());
app.use('/',[loginMiddlware,registerMiddleware,projectMiddleware]);
module.exports = app;