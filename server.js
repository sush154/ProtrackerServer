var app = require('./app');
const PORT = process.env.PROCESS || 9000;
app.listen(PORT, function(){
	console.log("app is listening on port 9000");
})