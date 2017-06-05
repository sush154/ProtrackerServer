var express = require('express'),
	ProjectMiddlewre = express(),
	ProjectRouter = express.Router();

var ProjectModel = require('../../model/project');
var UserModel = require('../../model/user');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dateConverter = require('../../util/dateConverter');

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
    }/*next();*/
});

ProjectRouter.get('/getAllProjects', function(req, res, next){
	
	var userId = req.cookies['token'].split('-')[1];
	//var userId = "591ac03b5f2cf028a0124b6b";
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
	newProject.isCurrent = req.body.isCurrent;
	if(!req.body.isCurrent){
		console.log(111);
		if(req.body.completionDate !== undefined && req.body.completionDate !== ''){
			console.log(222);
			newProject.completionDate = dateConverter(req.body.completionDate);
			console.log(req.body.completionDate);
		}else{
			console.log(333);
			newProject.completionDate = "";
		}
	}else {
		console.log(444);
		if(req.body.expCompDate !== undefined && req.body.expCompDate !== ''){
			console.log(555);
			newProject.expCompDate = dateConverter(req.body.expCompDate);
		}else{
			console.log(666);
			newProject.expCompDate = "";
		}
	}
	
		
	var currentProject = req.cookies['currentProject'];
	if(currentProject !== '' && (req.body.isCurrent || req.body.isCurrent === 'true')){
		res.json({data: {status : 201}});
	}
	else{
		newProject.save(function(err, project){
			if(err){console.log(err); res.json({data: {status : 500}});}
			else{
				//if cookies does not have current project, add current one in cookies 
				res.cookie('currentProject',project._id, { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
				
				//update user document, with current project id and update the project id in session
				UserModel.update({_id: userId},{'currentProject' : project._id}, function(err, doc){
					if(err) res.json({data: {status : 500}});
					res.json({data: {status : 200}});
				});
			
			}
		});
	}
});

ProjectRouter.get('/getProject/:projectId', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	ProjectModel.findOne({projectId: req.params.projectId, userId : userId}).populate('client').exec(function(err, project){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200, project}});
	});
});

ProjectRouter.post('/updateProject', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	//var userId = "591ac03b5f2cf028a0124b6b";
	
	var projectUpdate = {};
	
	if(req.body.projectName !== ""){
		projectUpdate.projectName = req.body.projectName;
	}
	
	if(req.body.description !== ""){
		projectUpdate.description = req.body.description;
	}
	
	if(req.body.client !== ""){
		projectUpdate.client = req.body.client;
	}
	
	projectUpdate.isCurrent = req.body.isCurrent;
	
	if(req.body.expCompDate !== "" && req.body.expCompDate !== null){
		if(req.body.isCurrent){
			projectUpdate.expCompDate = dateConverter(req.body.expCompDate);
		}else {
			projectUpdate.expCompDate = "";
		}
	}
	
	
	if(req.body.completionDate !== "" && req.body.completionDate !== null){
		if(!req.body.isCurrent){
			projectUpdate.completionDate = dateConverter(req.body.completionDate);
			projectUpdate.isCurrent = 'false';
			
			//remove current project id from cookies
			res.cookie('currentProject','', { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
			
			//Update user document, by removing current project id.
			UserModel.update({_id: userId},{'currentProject' : ''}, function(err, doc){
				if(err) res.json({data: {status : 500}});
				res.json({data: {status : 200}});
			});
		}else {
			projectUpdate.completionDate = "";
		}
	}
	
	console.log(projectUpdate);
	//update project document
	ProjectModel.update({userId : userId, projectId: req.body.projectId},{projectUpdate}, function(err, doc){
		if(err) res.json({data:{status : 500}});
		res.json({data: {status : 200}});
	});
});


ProjectRouter.post('/deleteProject', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	var projectId = req.body.projectId;
	
	ProjectModel.findByIdAndRemove({_id : projectId, userId : userId}, function(err, project){
		if(err) res.json({data:{status : 500}});
		else {
			var currentProject = req.cookies['currentProject'];
			if(projectId === currentProject){
				//remove current project id from cookies
				res.cookie('currentProject','', { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});				
			}
			
			res.json({data: {status : 200}});
		}
	})
});

ProjectMiddlewre.use('/project', ProjectRouter);

module.exports = ProjectMiddlewre;