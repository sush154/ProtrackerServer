var express = require('express')
	NoteMiddleware = express()
	NoteRouter = express.Router();

var NoteModel = require('../../model/note');
var session = require('express-session');
var cookieParser = require('cookie-parser');

NoteRouter.use(cookieParser());
NoteRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} })); // session secret


NoteRouter.use(function (req, res, next){
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

/**
 * Method to get all the notes for the logged in user
 */
NoteRouter.get('/getAllNotes', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	NoteModel.find({userId : userId}, function(err, notes){
		if(err){
			return res.json({data: {status : 500}});
		}else{
			res.json({data: {status : 200, notes}});
		}
	})
});

/**
 * Method to add note for the logged in user
 */
NoteRouter.post('/addNote', function(req, res){
	var userId =req.cookies['token'].split('-')[1];
	
	var newNote = new NoteModel();
	newNote.note = req.body.note.replace(/\n/g, '<br />');
	newNote.noteType = req.body.noteType;
	newNote.userId = userId;
	
	newNote.save(function(err, doc){
		if(err) {return res.json({data: {status : 500}});}
		res.json({data: {status : 200}});
	})
});

NoteMiddleware.use('/notes', NoteRouter);

module.exports = NoteMiddleware;