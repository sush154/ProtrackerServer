var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	connection = require('./connection');

var loginMiddlware = require('./router/login/router');
var registerMiddleware = require('./router/register/router');
var projectMiddleware = require('./router/project/router');
var clientMiddleware = require('./router/client/router');
var taskMiddleware = require('./router/task/router');


app.use(bodyParser.json());
app.use('/',[loginMiddlware,registerMiddleware,projectMiddleware, clientMiddleware, taskMiddleware]);
module.exports = app;