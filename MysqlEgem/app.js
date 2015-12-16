
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

var mysql = require('mysql');
var dbConfig = {
	host:'localhost',
	database:'moviest',
	user:'root',
	password:'123456789'
};

var connection = mysql.createConnection(dbConfig);
connection.connect(function(err){
	if(err){console.err(err); return;}
	console.log('connected ad id:'+connection.threadId); // 쓰레드 몇번 접속했는지!
})

//app.get('/', routes.index);
app.get('/', function(req,res){
	var insert = 'insert into movie(title,director,year) values(?,?,?);'; //값이 하나라도 배열로 담아야 JSON으로 넘어옴
	connection.query(insert, ['토토로','미야자키 하야오',1980], // connection이 2개일경우 콜백에 넣는다 차근차근 읽어나가다록
			function(err,results){
				connection.query('select * from movie;' , function(err,results){ // results는 배열이옴 result는 하나
						res.send(JSON.stringify(results)); // db내용을 친절히 JSON으로 넘겨줌
				});
		})	
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
