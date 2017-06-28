var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	connection = require('./connection');

var loginMiddlware = require('./router/login/router');
var registerMiddleware = require('./router/register/router');
var projectMiddleware = require('./router/project/router');
var clientMiddleware = require('./router/client/router');
var taskMiddleware = require('./router/task/router');
var logoutMiddleware = require('./router/logout/router');
var noteMiddleware = require('./router/note/router');


app.use(bodyParser.json());
app.use('/',[loginMiddlware,registerMiddleware,projectMiddleware, clientMiddleware, taskMiddleware, logoutMiddleware, noteMiddleware]);
module.exports = app;