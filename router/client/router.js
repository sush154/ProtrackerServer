var express = require('express'),
	ClientMiddleware = express(),
	ClientRouter = express.Router();
var clientModel = require('../../model/client');
var session = require('express-session');
var cookieParser = require('cookie-parser');

ClientRouter.use(cookieParser());
ClientRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} })); // session secret


ClientRouter.use(function (req, res, next){
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
	    next();
	} else {
	    res.cookie("token", "", { expires: new Date() });
	    res.json({data: {status : 401}});
	}/*next();*/
});


ClientRouter.post('/addClient', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	var newClient = new clientModel();
	newClient.clientName = req.body.clientName;
	newClient.clientDomain = req.body.clientDomain;
	newClient.description = req.body.description;
	newClient.userId = userId;
	
	newClient.save(function(err, doc){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	})
});

ClientRouter.get('/getAllClient', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	//var userId = "591ac03b5f2cf028a0124b6b";
	clientModel.find({userId : userId}, function(err, clients){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200, clients}});
	})
});

ClientMiddleware.use('/client', ClientRouter);

module.exports = ClientMiddleware;