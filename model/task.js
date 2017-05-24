var mongoose = require('mongoose');

var TaskSchema = require('../schema/task');

var TaskModel = mongoose.model('task', TaskSchema);

module.exports = TaskModel;