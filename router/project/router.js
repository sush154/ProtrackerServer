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
        return res.json({data: {status : 401}});
    }/*next();*/
});

ProjectRouter.get('/getAllProjects', function(req, res, next){
	
	var userId = req.cookies['token'].split('-')[1];
	//var userId = "591ac03b5f2cf028a0124b6b";
	ProjectModel.find({'userId': userId}).populate('client').select('_id projectId projectName client isCurrent').exec(function(err, projects){
		if(err) return res.json({data:{status : 500}});
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
		if(req.body.completionDate !== undefined && req.body.completionDate !== ''){
			newProject.completionDate = dateConverter(req.body.completionDate);
			console.log(req.body.completionDate);
		}else{
			newProject.completionDate = "";
		}
	}else {
		if(req.body.expCompDate !== undefined && req.body.expCompDate !== ''){
			newProject.expCompDate = dateConverter(req.body.expCompDate);
		}else{
			newProject.expCompDate = "";
		}
	}
	
		
	var currentProject = req.cookies['currentProject'];
	
	if((currentProject !== 'undefined' && currentProject !== '') && (req.body.isCurrent || req.body.isCurrent === 'true')){
		return res.json({data: {status : 201}});
	}
	else{
		newProject.save(function(err, project){
			if(err){console.log(err); res.json({data: {status : 500}});}
			else{
				//if cookies does not have current project, add current one in cookies
				
				if(newProject.isCurrent){
					res.cookie('currentProject',String(project._id), { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
				
					//update user document, with current project id and update the project id in session
					UserModel.update({_id: userId},{'currentProject' : project._id}, function(err, doc){
						if(err) return res.json({data: {status : 500}});
						res.json({data: {status : 200}});
					});
				}else {
					res.json({data: {status : 200}});
				}
			
			}
		});
	}
});

ProjectRouter.get('/getProject/:projectId', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	console.log(req.params.projectId);
	ProjectModel.findOne({projectId: req.params.projectId, userId : userId}).populate('client').exec(function(err, project){
		if(err) return res.json({data:{status : 500}});
		res.json({data: {status : 200, project}});
	});
});

ProjectRouter.post('/updateProject', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	//var userId = "591ac03b5f2cf028a0124b6b";
	console.log(req.body);
	
	var updatedProject = {};
	
	if(req.body.projectName !== ""){
		updatedProject.projectName = req.body.projectName;
	}
	
	if(req.body.description !== ""){
		updatedProject.description = req.body.description;
	}
	
	if(req.body.client !== ""){
		updatedProject.client = req.body.client;
	}
	
	if(req.body.isCurrent){
		if(req.body.expCompDate !== "" && req.body.expCompDate !== null){
			if(req.body.isCurrent){
				updatedProject.expCompDate = dateConverter(req.body.expCompDate);
			}else {
				updatedProject.expCompDate = null;
			}
		}
		updatedProject.isCurrent = true;
	}else {
		if(req.body.completionDate !== "" && req.body.completionDate !== null){
			updatedProject.completionDate = dateConverter(req.body.completionDate);
			}else {
				updatedProject.completionDate = null;
			}
		
		updatedProject.isCurrent = false;
	}
	
	/*ProjectModel.findOne({userId : userId, _id : req.body._id}, function(err, doc){
		
		
		doc.save();
		res.json({data: {status : 200}});
	});
	*/
	
	ProjectModel.update({userId : userId, _id : req.body._id}, {$set: updatedProject}, function(err, doc){
		if(err) res.json({data:{status : 500}});
		res.cookie('currentProject','', { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
		
		//update user document, with current project id and update the project id in session
		UserModel.update({_id: userId},{'currentProject' : ''}, function(err, doc){
			if(err) return res.json({data: {status : 500}});
			res.json({data: {status : 200}});
		});
	})
});


ProjectRouter.post('/deleteProject', function(req, res, next){
	var userId = req.cookies['token'].split('-')[1];
	
	var projectId = req.body.projectId;
	
	ProjectModel.findByIdAndRemove({_id : projectId, userId : userId}, function(err, project){
		if(err) return res.json({data:{status : 500}});
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

ProjectRouter.post('/projectFilter', function(req, res){
	var userId = req.cookies['token'].split('-')[1];
	
	var query = {};
	
	query['userId'] = userId;
	query[req.body.filterType] = req.body.filterValue;

	if(req.body.filterType === 'clientDomain'){
		ProjectModel.find({'userId' : userId}).populate({path : 'client', match : {clientDomain : req.body.filterValue}}).select('_id projectId projectName client isCurrent').exec(function(err, projects){
			if(err) {console.log(err); return res.json({data:{status : 500}});}
			let projRes = projects.filter(function(project){if(project.client){return project;}});
			res.json({data: {status : 200, projects:projRes}});
		});
	}else if(req.body.filterType === 'projectName'){
		ProjectModel.find({'userId' : userId, 'projectName' : new RegExp(req.body.filterValue, 'i')}).populate('client').select('_id projectId projectName client isCurrent').exec(function(err, projects){
			if(err) {console.log(err); return res.json({data:{status : 500}});}
			res.json({data: {status : 200, projects}});
		});
	}else {
		ProjectModel.find(query).populate('client').select('_id projectId projectName client isCurrent').exec(function(err, projects){
			if(err) {console.log(err); return res.json({data:{status : 500}});}
			res.json({data: {status : 200, projects}});
		});
	}
	
});

ProjectMiddlewre.use('/project', ProjectRouter);

module.exports = ProjectMiddlewre;