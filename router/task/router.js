var express = require('express')
	TaskMiddleware = express();
	TaskRouter = express.Router();
	
var TaskModel = require('../../model/task');
var CommentModel = require('../../model/comment');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dateConverter = require('../../util/dateConverter');

TaskRouter.use(cookieParser());
TaskRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} })); // session secret


TaskRouter.use(function (req, res, next){
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    /*if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
	    next();
	} else {
	    res.cookie("token", "", { expires: new Date() });
	    res.json({data: {status : 401}});
	}*/next();
});


TaskRouter.post('/addTask', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	var expectedCompletionDate = new Date();
	
	var newTask = new TaskModel();
	newTask.taskSummary = req.body.taskSummary;
	newTask.criticality = req.body.criticality;
	newTask.description = req.body.description;
	newTask.taskType = req.body.taskType;
	newTask.taskStatus = req.body.taskStatus;
	newTask.userId = userId;
	newTask.expectedComDate = dateConverter(req.body.expectedComDate);

	
	newTask.save(function(err, doc){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	});
});

TaskRouter.get('/getAllTasks', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	TaskModel.find({userId : userId},'taskId taskSummary criticality expectedComDate taskStatus', function(err, tasks){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200, tasks}});
	});
});

TaskRouter.get('/getTask/:id', function(req, res){
	var taskId = req.params.id;
	
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	TaskModel.findOne({userId : userId, taskId : taskId}).populate('taskComments').exec(function(err, task){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200, task}});
	});
});

TaskRouter.post('/updateTask', function(req, res){
	
	var taskId = req.body.taskId;
	
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	var taskUpdates = {};
	
	if(req.body.taskSummary !== ""){
		taskUpdates.taskSummary = req.body.taskSummary;
	}
	
	if(req.body.criticality !== ""){
		taskUpdates.criticality = req.body.criticality;
	}
	
	if(req.body.description !== ""){
		taskUpdates.description = req.body.description;
	}
	
	if(req.body.taskType !== ""){
		taskUpdates.taskType = req.body.taskType;
	}
	
	if(req.body.taskStatus !== ""){
		taskUpdates.taskStatus = req.body.taskStatus;
		
		if(req.body.taskStatus === "Completed"){
			taskUpdates.completionDate = dateConverter(req.body.completionDate);
		}
	}
	
	if(req.body.expectedComDate !== ""){
		taskUpdates.expectedComDate = req.body.expectedComDate;
	}
	
	TaskModel.update({userId : userId, taskId : taskId}, taskUpdates, function(err, doc){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	})
});


TaskRouter.post('/addComment', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	var newComment = new CommentModel();
	newComment.comment = req.body.comment;
	
	
	newComment.save(function(err, doc){
		if(err) res.json({data: {status : 500}});
		
		var taskUpdates = {};
		
		taskUpdates.taskComments = [doc._id];
		
		TaskModel.update({userId : userId, taskId : req.body.taskId}, {'$push':{'taskComments' : doc._id}},  function(err, task){
			if(err) res.json({data: {status : 500}});
			res.json({data: {status : 200}});
		})
	});
});

TaskRouter.post('/addImage', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';
	
	TaskModel.update({userId : userId, taskId : req.body.taskId},{'$push' : {'images' : req.body.image}}, function(err, task){
		if(err) res.json({data: {status : 500}});
		res.json({data: {status : 200}});
	});
});



TaskMiddleware.use('/task', TaskRouter);

module.exports = TaskMiddleware;