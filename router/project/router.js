var express = require('express'),
	ProjectMiddlewre = express(),
	ProjectRouter = express.Router();

var ProjectModel = require('../../model/project');

ProjectRouter.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

ProjectRouter.get('/getAllProjects', function(req, res, next){
	
	var userId = "591ac03b5f2cf028a0124b6b";
	ProjectModel.find({'userId': userId}).exec(function(err, projects){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200, projects}});
	})
	
});

ProjectRouter.post('/addProject', function(req, res, next){
	
	var userId = "591ac03b5f2cf028a0124b6b";
	
	var newProject = new ProjectModel();
	newProject.projectName = req.body.projectName;
	newProject.clientId = req.body.clientId;
	newProject.clientName = req.body.clientName;
	newProject.completionFlag = req.body.completionFlag;
	newProject.userId = userId;
	newProject.description = req.body.description;
	
	newProject.save(function(err, project){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	});
});

ProjectRouter.get('/getProject/:projectId', function(req, res, next){
	var user = "591ac03b5f2cf028a0124b6b";
	
	ProjectModel.findOne({projectId: req.params.projectId, userId : user},function(err, project){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200, project}});
	});
});

ProjectMiddlewre.use('/project', ProjectRouter);

module.exports = ProjectMiddlewre;