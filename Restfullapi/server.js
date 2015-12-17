/**
 * RESTfullAPIexam server.js
 */

var http = require('http');
/*
 *  디비전에 배열로 테스트 
 *  디비 연결시 삭제,
var movieList = ['아바타','스타워즈','인터스텔라'];
var movieDetail = {
		'아바타':{
			director:'제임스 카메론'
		},
		'스타워즈':{
			director:'조지 루카스'
		},
		'인터스텔라':{
			director:'크리스토퍼 놀란'
		}
};
*/
/////// mysql 연결
var mysql = require('mysql');
var connection = mysql.createConnection({
	host:'localhost', user:'root',password:'123456789', database:'moviest'
});
// 연결되었는지 확인
connection.connect(function(err){
	if(err){console.err(err); return;}
	console.log('connected as id : '+connection.threadId);
});
/////// mysql 연결

///////// mongodb 연결
var MongoClient = require('mongodb').MongoClient;
var mongodb;
MongoClient.connect('mongodb://localhost:27017/moviest',function(err,db){
	if(err){console.err(err); return;}
	console.log('Connected correctly to server');
	mongodb = db;
});
///////// mongodb 연결

var server = http.createServer(function(req,res){
	var method = req.method.toLowerCase();
	switch(method){
	case 'get': handleGetRequest(req,res); return;
	case 'post': handlePostRequest(req,res);	return;
	case 'put': handlePutRequest(req,res); return;
	case 'delete': handleDeleteRequest(req,res);return;
	default: res.statusCode = 404; res.end('Wrong Method'); return;
	}
});
server.listen(3000);

//영화 전체 목록 조회 API
var urlencode = require('urlencode');
function handleGetRequest(req,res){
	if(req.url == '/movies'){ 
		
		// 디비없을때 배열이였지만 쿼리날릴땐 커넥션 연결해 쿼리만 날려주면 된다
		//res.writeHeader(200,{'Content-Type':'application/json;charset=UTF-8'});
		//res.end(JSON.stringify(movieList));		
		
		connection.query('select title from movie;', function(err,results){
			//if(err){console.err(err); return;};
			var list = [];
			for(var i=0;i<results.length;i++){
				list.push(results[i].title);
			}
			res.writeHeader(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify(list));
		});		
	}else{ // 특정 영화 정보 조회 API
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		
		connection.query('select * from movie where title=?;',[itemName], // 배열에 담기
				function(err,results){
					if(err){res.statusCode = 404; res.end('Wrong movie name');}
					if(results.length > 0){
						
						//mongodb mysql과 합치기
						var movieCollection = mongodb.collection('movie'); 
						movieCollection.find({movie_id:results[0].movie_id}).toArray(function(err,docs){
							var joinResult = JSON.stringify(results[0]);
							joinResult = JSON.parse(joinResult);
							if(docs.length > 0){
								joinResult.comments = docs[0].comments;
							}else{
								joinResult.comments = [];
							}
							res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
							res.end(JSON.stringify(joinResult));
						});
						
						//mysql 만 쓸때
						//res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
						//res.end(JSON.stringify(results[0]));
					}else{
						res.statusCode = 404; res.end('Wrong movie name');
					}
		});
		
		/*var item = movieDetail[itemName]; // 해당 영화정보를 객체로 받아옴
		if(item){
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify(item));
		}else{
			res.statusCode = 404; res.end('Wrong movie name');
		}
		*/
	}
}

var querystring = require('querystring');

//새로운 영화 정보 추가 API
function handlePostRequest(req,res){
	if(req.url == '/movies'){// mysql 
		var body = '';
		req.on('data' , function(chunk){body += chunk});
		req.on('end',function(){
			var movie = querystring.parse(body);			
			connection.query('insert into movie(title,director,year,synopsis) values(?,?,?,?);',
					[movie.title,movie.director,Number(movie.year),movie.synopsis],
					function(err,results){
						res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
						res.end(JSON.stringify(results));
			});
						
			/* db없을때 배열
			movieList.push(movie.title);
			movieDetail[movie.title] = {director:movie.director};
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movie:movie}));
			*/
		});
	}else{ // mongodb
		// 영화 댓글 추가 API(/movies/comment/영화이름)
		var itemName = req.url.split('/')[3]; // 4번째를 꺼내지 3번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		var body = '';
		req.on('data' , function(chunk){body += chunk});
		req.on('end',function(){
			var movie = querystring.parse(body);
			connection.query('select movie_id from movie where title=?;',[itemName], 
				function(err,results){
					if(results.length > 0){//해당 영화에 대한 movie_id가 존재함을 의미
						var movieCollection = mongodb.collection('movie');
						movieCollection.find({movie_id:results[0].movie_id}).toArray(function(err,docs){
								if(docs.length > 0){//기존에 댓글이 존재함을 의미
									movieCollection.update({movie_id:results[0].movie_id},
											{'$push':{comments:movie.comment}}, // 기존 도큐먼트 수정
											function(err,result){
												res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
												res.end(JSON.stringify(result));
											});
								}else{//해당 movie_id에 대한 댓글이 없을 의미
									movieCollection.save(// 새로운 도큐먼트 추가
											{movie_id:results[0].movie_id,comments:[movie.comment]},
											function(err, result){
												res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
												res.end(JSON.stringify(result));
											});
								}
						});
					}
			});
		});
	}
}

var async = require('async');
//영화 목록 전체 변경 API
function handlePutRequest(req,res){
	if(req.url == '/movies'){ 
		var body = '';
		req.on('data',function(chunk){body += chunk;});
		req.on('end',function(){
			var movie = querystring.parse(body);
			var movies = JSON.parse(movie.movieList); // JSON문자열 -> 객체(배열)
			
			connection.query('delete from movie;',function(err,result){
				if(err){res.statusCode = 404; res.end('Wrong movie name');}
				else{
					var funcList = [];
					var count = 0; // 비동기라 끝을 알려면 funcList에 함수를 넣고 count로 숫자를 올려주고 series로 끝을 알려주고 뿌려줌.
					// 비동기자체는 흐름제어가 어려움, 포문으로 다 돌리고 항상 끝을 알려줘야함
					for(var i=0;i<movies.length;i++){
						var func1 = function(callback){
							connection.query('insert into movie(title,director,year,synopsis) values(?,?,?,?);',
								[movies[count].title,movies[count].director,Number(movies[count].year),movies[count].synopsis],
								function(err,result){
									callback(null,result);
							});
							count++;
						};
						funcList.push(func1);
					}
					async.series(funcList,function(err,results){
						res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
						res.end(JSON.stringify(results));
					});
				}
			});
			
			/*
			movieList = []; // 기존 영화목록 초기화
			movieDeatail = {}; // 기존 영화상세 정보 초기화
			
			for(var i=0;i<movies.length;i++){
				movieList.push(movies[i].title);
				movieDetail[movies[i].title] = {director:movies[i].director};				
			}
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
			 */		
		})		
	}else{ // 영화정보 수정 API (만일 해당 영화가 없으면 영화 정보 추가)
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		
		var body='';
		req.on('data',function(chunk){body+=chunk;});
		req.on('end',function(){
			var movie = querystring.parse(body);			
			
			connection.query('select * from movie where title=?;',[itemName],
					function(err,results){
						if(err){res.statusCode = 404; res.end('Wrong movie name');}
						else{
							if(results.length>0){
								// 영화정보 수정
								connection.query(
										'update movie set director=?,year=?,synopsis=? where title=?;',
										[movie.director,Number(movie.year),movie.synopsis,itemName],
										function(err,result){
											if(err){res.statusCode = 404; res.end(err);}
											else{
												res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
												res.end(JSON.stringify(result));
											}
										})
							}else{
								// 영화정보내용이 없을때
								connection.query(
										'insert into movie(title,director,year,synopsis) value(?,?,?,?);',
										[itemName, movie.director, Number(movie.year), movie.synopsis],
										function(err,result){
											if(err){res.statusCode = 404; res.end(err);}
											else{
												res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
												res.end(JSON.stringify(result));
											}
										});
							}
						}
			});
			
			/*
			if(movieDetail[itemName]){ // 기존의 영화 정보가 있을 경우
				movieDetail[itemName].director = movie.director;
			}else{ // 영화정보가 없을 경우
				movieList.push(itemName);
				movieDetail[itemName] = {director : movie.director};
			}
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieDetail:movieDetail}));
			*/
		});
	}
}

function handleDeleteRequest(req,res){
	if(req.url == '/movies'){ // 전체목록 삭제
		connection.query('delete from movie:', function(err,result){
			if(err){res.statusCode = 404; res.end(err);}
			else{
				res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
				res.end(JSON.stringify(result));
			}
		});
		//movieList = [];
		//movieDetail = {};
		//res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
		//res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
	}else{ // 특정 영화 정보 삭제 API
		
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		
		connection.query('delete from movie where title=?;',[itemName],
				function(err,result){
					if(err){res.statusCode = 404; res.end(err);}
					else{
						res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
						res.end(JSON.stringify(result));
					}
				}
		)
		/*
		if(movieDetail[itemName]){
			var index = movieList.indexOf(itemName);
			if(index != 1) movieList.splice(index,1); // 배열에서 영화 이름 제거
			delete movieDetail[itemName]; // 영화 상세 정보 제거
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
		}else{
			res.statusCode = 404; res.end("Wrong movie name");
		}
		*/
		
	}
}


