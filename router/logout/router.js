var express = require('express'),
	LogoutMiddleware = express(),
	LogoutRouter = express.Router();

var session = require('express-session');
var cookieParser = require('cookie-parser');

LogoutRouter.use(cookieParser());
LogoutRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} })); // session secret

LogoutRouter.use(function(req, res, next){
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

LogoutRouter.post('', function(req, res, next){
	
	req.session.destroy(function(err) {
		
		// Clear Cookies
		res.clearCookie("currentProject");
		res.clearCookie("token");
		
		if(err)res.json({data:{status : 500}});
		else res.json({data:{status : 200}});
	});
	
});

LogoutMiddleware.use('/user/logout', LogoutRouter);

module.exports = LogoutMiddleware;