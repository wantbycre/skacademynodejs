
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
app.set('port', process.env.PORT || 3001);
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

app.get('/', routes.index);
app.get('/users', user.list);

var request = require('request');

// 추가
app.post('/movie/add',function(req,res){
	console.log(req.body.title);
	console.log(req.body.director);
	
	request.post({url:'http://127.0.0.1:3000/movies',
		form : {title:req.body.title, director:req.body.director}},
		function(err,httpResponse,body){
			console.log(body);
			res.redirect('/');
	})
});

var urlencode = require('urlencode');

// 수정하기
app.post('/movie/modify' , function(req,res){
	var movieName = urlencode(req.body.title);
	request.put({url:'http://127.0.0.1:3000/movies/'+movieName,
		form:{title:req.body.title, director:req.body.director}},
		function(err,httpResponse,body){
			console.log(body);
			res.redirect('/movie/'+movieName);
		} // form은 request에서 만든 body postman에서 키벨류 넣는것 비슷
	)
});

// 전체 수정
app.post('/movies/modify' , function(req,res){
	request.put({url:'http://127.0.0.1:3000/movies',
		form:{movieList:req.body.movies}}, function(err,httpResponse,body){
			console.log(body);
			res.redirect('/');
	})
});

// 개별삭제
app.post('/movie/delete',function(req,res){
	var movieName = urlencode.encode(req.body.title);//인코딩
	request.del({url:'http://127.0.0.1:3000/movies/'+movieName,
		form:{}}, function(err,httpResponse,body){
			console.log(body);
			res.redirect('/');
	});
});

// 전체 삭제
app.post('/movies/delete' , function(req,res){
	request.del({url:'http://127.0.0.1:3000/movies',form:{}}, 
			function(err,httpResponse,body){
			console.log(body);
			res.redirect('/');
	});
});

// detail.jade로 넘겨주기
app.get('/movie/:movie',function(req,res){
	console.log(req.params.movie);
	var movieName = req.params.movie;
	movieName = urlencode.encode(movieName);
	request('http://127.0.0.1:3000/movies/'+movieName ,
				function(error,response,body){
					if(!error && response.statusCode == 200){
						//res.send(body);
						res.render('detail.jade',{title:'Movie Info',
							movie:{title:req.params.movie,
								director:(JSON.parse(body)).director}});
				}		
	});	  
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
