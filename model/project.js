var mongoose = require('mongoose');

var projectSchema = require('../schema/project');

var ProjectModel = mongoose.model('project',projectSchema);

module.exports = ProjectModel;