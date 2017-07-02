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
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
	    next();
	} else {
	    res.cookie("token", "", { expires: new Date() });
	    return res.json({data: {status : 401}});
	}/*next();*/
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
	newTask.taskStatus = req.body.taskStatus;
	newTask.userId = userId;
	newTask.expectedComDate = dateConverter(req.body.expectedComDate);
	newTask.project = req.body.projectId;

	newTask.save(function(err, doc){
		if(err) {return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	});
});

/**
 * Method to populate the tasks for current project
 */
TaskRouter.get('/getProjectTasks', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	var projectId = req.cookies['currentProject'];

	if(projectId === ''){
		return res.json({data: {status : 200, tasks : []}});
	}else {
		TaskModel.find({userId : userId, project : projectId},'taskId taskSummary criticality expectedComDate taskStatus completionDate', function(err, tasks){
			if(err) {console.log(err); return res.json({data: {status : 500}});}
			res.json({data: {status : 200, tasks}});
		});
	}

	/*if(projectId === 'undefined' && projectId === ""){
		return res.json({data: {status : 201}});
	}else{
		TaskModel.find({userId : userId, project : projectId},'taskId taskSummary criticality expectedComDate taskStatus completionDate', function(err, tasks){
			if(err) {console.log(err); return res.json({data: {status : 500}});}
			res.json({data: {status : 200, tasks}});
		});
	}*/


});

/**
 * Method to populate all the tasks irrelevant to current project. The tasks would be populated for logged in user
 */

TaskRouter.get('/getAllTasks', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	TaskModel.find({userId : userId},'taskId taskSummary criticality expectedComDate taskStatus completionDate', function(err, tasks){
		if(err) {return res.json({data: {status : 500}});}
		res.json({data: {status : 200, tasks}});
	});
});

/**
 * Method to task details for selected task
 */

TaskRouter.get('/getTask/:id', function(req, res){
	var taskId = req.params.id;

	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	TaskModel.findOne({userId : userId, taskId : taskId}).populate([{path:'taskComments'},{path:'project'}]).exec(function(err, task){
		if(err) {return res.json({data: {status : 500}});}
		res.json({data: {status : 200, task}});
	});
});

/**
 * Method for updating selected task. The task which are marked as complete could not be updated
 */

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

	/*if(req.body.taskStatus !== ""){
		taskUpdates.taskStatus = req.body.taskStatus;

		if(req.body.taskStatus === "Completed"){
			taskUpdates.completionDate = dateConverter(req.body.completionDate);
		}
	}*/

	if(req.body.expectedComDate !== ""){
		taskUpdates.expectedComDate = dateConverter(req.body.expectedComDate);
	}

	TaskModel.update({userId : userId, _id : req.body._id}, {$set: taskUpdates}, function(err, doc){
		if(err){console.log(err);return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	});
});

/**
 * Method to delete task
 */
TaskRouter.post('/deleteTask', function(req, res){
	var userId = req.cookies['token'].split('-')[1];

	var taskId = req.body.taskId;

	// Retrieve comments of the task and remove them first
	TaskModel.findOne({_id : taskId, userId : userId}, function(err, doc){
		for(let comment of doc.taskComments){
			CommentModel.findByIdAndRemove({_id : comment}, function(err, comment){
				if(err) {console.log("comment delete ",err); return res.json({data:{status : 500}});}
			})
		}

		// Remove task
		TaskModel.findByIdAndRemove({_id : taskId, userId : userId}, function(err, doc){
			if(err) {console.log("task delete ", err); return res.json({data:{status : 500}});}
			res.json({data: {status : 200}});
		});


	});


});

/**
 * Method to add comment for the selected task
 */
TaskRouter.post('/addComment', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	var newComment = new CommentModel();
	newComment.comment = req.body.comment;
	newComment.date = new Date();

	newComment.save(function(err, doc){
		if(err){ return res.json({data: {status : 500}});}

		var taskUpdates = {};

		taskUpdates.taskComments = [doc._id];

		TaskModel.update({userId : userId, _id : req.body.taskId}, {'$push':{'taskComments' : doc._id}},  function(err, task){
			if(err) {return res.json({data: {status : 500}});}
			res.json({data: {status : 200}});
		})
	});
});

/**
 * Method for updating comment
 */
TaskRouter.post('/updateComment', function(req, res){

	var updateComment = {};

	if(req.body.comment !== ""){
		updateComment.comment = req.body.comment;
	}

	CommentModel.update({_id : req.body._id}, {$set : updateComment}, function(err, doc){
		if(err){return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	});

});

/**
 * Method for deleting comment
 */
TaskRouter.post('/deleteComment', function(req, res){
	var userId = req.cookies['token'].split('-')[1];

	CommentModel.findByIdAndRemove({_id : req.body._id}, function(err, comment){
		if(err){return res.json({data:{status : 500}});}

		else{
			TaskModel.update({userId : userId, _id : req.body.taskId}, {'$pull' : {'taskComments' : req.body._id}}, function(err, task){
				if(err){console.log("error in task update", err); return res.json({data:{status : 500}});}
				res.json({data: {status : 200}});
			});
		}
	});
});

/**
 * Method to add image for selected task
 */
TaskRouter.post('/addImage', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	TaskModel.update({userId : userId, taskId : req.body.taskId},{'$push' : {'images' : req.body.image}}, function(err, task){
		if(err) {return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	});
});

/**
 * Method to change the status of the task
 */
TaskRouter.post('/changeStatus', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	TaskModel.update({userId : userId, _id : req.body.taskId}, {$set: {'taskStatus' : req.body.taskStatus}}, function(err, doc){
		if(err){console.log(err);return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	});
});

/**
 * Method to mark task as defective
 */
TaskRouter.post('/markDefective', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	var newComment = new CommentModel();
	newComment.comment = req.body.comment;
	newComment.date = new Date();

	newComment.save(function(err, doc){
		if(err){ return res.json({data: {status : 500}});}

		var taskUpdates = {};

		taskUpdates.taskComments = [doc._id];

		TaskModel.update({userId : userId, _id : req.body.taskId}, {'$push':{'taskComments' : doc._id}},  function(err, task){
			if(err) {return res.json({data: {status : 500}});}
			else {
				//res.json({data: {status : 200}});
				TaskModel.update({userId : userId, _id : req.body.taskId}, {$set: {'taskStatus' : '5'}}, function(err, doc){
					if(err){console.log(err);return res.json({data: {status : 500}});}
					res.json({data: {status : 200}});
				});
			}
		})
	});
});

/**
 * Method to mark task as complete
 */
TaskRouter.post('/markComplete', function(req, res){
	var userId =req.cookies['token'].split('-')[1];

	//var userId = '591ac03b5f2cf028a0124b6b';
	//var userId = '591ad73de365082a6c00db32';

	var newComment = new CommentModel();
	newComment.comment = req.body.comment;
	newComment.date = new Date();

	newComment.save(function(err, doc){
		if(err){ return res.json({data: {status : 500}});}

		var taskUpdates = {};

		taskUpdates.taskComments = [doc._id];

		TaskModel.update({userId : userId, _id : req.body.taskId}, {'$push':{'taskComments' : doc._id}},  function(err, task){
			if(err) {return res.json({data: {status : 500}});}
			else {
				//res.json({data: {status : 200}});
				TaskModel.update({userId : userId, _id : req.body.taskId}, {$set: {'taskStatus' : '4', 'completionDate' : dateConverter(req.body.completionDate)}}, function(err, doc){
					if(err){console.log(err);return res.json({data: {status : 500}});}
					res.json({data: {status : 200}});
				});
			}
		})
	});
});

/**
* Method to apply filter
*/
TaskRouter.post('/taskFilter', function(req, res){
	let userId =req.cookies['token'].split('-')[1];

	let query = {};

	let projectId = req.cookies['currentProject'];

	query['userId'] = userId;
	query[req.body.filterType] = req.body.filterValue;

	if(req.body.filterType === 'taskSummary'){
		TaskModel.find({'userId' : userId, 'taskSummary' : new RegExp(req.body.filterValue, 'i')}).select('taskId taskSummary criticality expectedComDate taskStatus completionDate').exec(function(err, tasks){
			if(err) {console.log(err); return res.json({data:{status : 500}});}
			res.json({data: {status : 200, tasks}});
		});
	}else if(req.body.filterValue === ''){
		TaskModel.find({userId : userId, project : projectId},'taskId taskSummary criticality expectedComDate taskStatus completionDate', function(err, tasks){
			if(err) {console.log(err); return res.json({data: {status : 500}});}
			res.json({data: {status : 200, tasks}});
		});
	}else {
		TaskModel.find(query).select('taskId taskSummary criticality expectedComDate taskStatus completionDate').exec(function(err, tasks){
			if(err) {console.log(err); return res.json({data:{status : 500}});}
			res.json({data: {status : 200, tasks}});
		});
	}

});

TaskMiddleware.use('/task', TaskRouter);

module.exports = TaskMiddleware;
