var express = require('express'),
	ProjectMiddlewre = express(),
	ProjectRouter = express.Router();

var ProjectModel = require('../../model/project');
var session = require('express-session');
var cookieParser = require('cookie-parser');

ProjectRouter.use(cookieParser());
ProjectRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} })); // session secret

ProjectRouter.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
        next();
    } else {
        res.cookie("token", "", { expires: new Date() });
        res.json({data: {status : 401}});
    }/*next()*/;
});

ProjectRouter.get('/getAllProjects', function(req, res, next){
	
	var userId = req.cookies['token'].split('-')[1];
	ProjectModel.find({'userId': userId}).populate('client').exec(function(err, projects){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200, projects}});
	})
	
});

ProjectRouter.post('/addProject', function(req, res, next){
	
	var userId = req.cookies['token'].split('-')[1];
	//var userId = "591ac03b5f2cf028a0124b6b";
	
	var newProject = new ProjectModel();
	newProject.projectName = req.body.projectName;
	newProject.client = req.body.client;
	newProject.completionFlag = req.body.completionFlag;
	newProject.userId = userId;
	newProject.description = req.body.description;
	
	newProject.save(function(err, project){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	});
});

ProjectRouter.get('/getProject/:projectId', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	ProjectModel.findOne({projectId: req.params.projectId, userId : user},function(err, project){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200, project}});
	});
});

ProjectMiddlewre.use('/project', ProjectRouter);

module.exports = ProjectMiddlewre;