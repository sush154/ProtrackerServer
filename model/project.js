var mongoose = require('mongoose');

var projectSchema = require('../schema/project');

var ProjectModel = mongoose.model('ProjectModel',projectSchema, 'project');

module.exports = ProjectModel;