var express = require('express'),
	RegisterMiddleware = express(),
	RegisterRouter = express.Router();

var NewUser = require('../../model/user');

RegisterRouter.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

RegisterRouter.post('', function(req, res, next){
	
	NewUser.find({'email':req.body.emailAddress}).exec(function(err, doc){
		if(doc.length === 0){
			var newUser = new NewUser();
			newUser.firstName = req.body.firstName;
			newUser.lastName = req.body.lastName;
			newUser.email = req.body.emailAddress;
			newUser.password = req.body.password;
			newUser.currentProject = '';
			
			newUser.save(function(err, doc){
				if(err) return res.json({data: {status : 500}});
				
				res.cookie('currentProject','', { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
				
				res.json({data: {status : 200}});
			});
		}else {
			res.json({data : {status : 101}});
		}
	})
	
	
});

RegisterMiddleware.use('/user/register', RegisterRouter);

module.exports = RegisterMiddleware;



	

