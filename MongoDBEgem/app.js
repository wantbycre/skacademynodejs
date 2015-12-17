
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var MongoClient = require('mongodb').MongoClient;
var mongodb;

// 몽고 접속
MongoClient.connect('mongodb://localhost:27017/moviest' , function(err,db){ // db 써놓은게 제일 중요
	if(err){console.log(err); return;}
	console.log('Connection correctly to server...');
	mongodb = db;
});

// 몽고 디비 확인
app.get('/', function(req,res){
	var movie = mongodb.collection('movie');
	movie.find({}).toArray(function(err,docs){
		res.send(JSON.stringify(docs));
	});
});


//몽고 디비 추가해보기
app.get('/add' , function(req,res){
	var movie = mongodb.collection('movie');
	movie.save({title:'이웃집 토로로',director:'미야자키 하야오',year:1988},
			function(err,results){
				res.redirect('/');
	});
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
