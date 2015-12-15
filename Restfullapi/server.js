/**
 * RESTfullAPIexam server.js
 */

var http = require('http');
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

var urlencode = require('urlencode');
function handleGetRequest(req,res){
	if(req.url == '/movies'){ // 영화 전체 목록 조회 API
		res.writeHeader(200,{'Content-Type':'application/json;charset=UTF-8'});
		res.end(JSON.stringify(movieList));
	}else{ // 특정 영화 정보 조회 API
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		var item = movieDetail[itemName]; // 해당 영화정보를 객체로 받아옴
		if(item){
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify(item));
		}else{
			res.statusCode = 404; res.end('Wrong movie name');
		}
	}
}

var querystring = require('querystring');

function handlePostRequest(req,res){
	if(req.url == '/movies'){ // 새로운 영화 정보 추가 API
		var body = '';
		req.on('data' , function(chunk){body += chunk});
		req.on('end',function(){
			var movie = querystring.parse(body);
			movieList.push(movie.title);
			movieDetail[movie.title] = {director:movie.director};
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movie:movie}));
		});
	}
}

function handlePutRequest(req,res){
	if(req.url == '/movies'){ // 영화 목록 전체 변경 API
		var body = '';
		req.on('data',function(chunk){body += chunk;});
		req.on('end',function(){
			var movie = querystring.parse(body);
			var movies = JSON.parse(movie.movieList); // JSON문자열 -> 객체(배열)
			movieList = []; // 기존 영화목록 초기화
			movieDeatail = {}; // 기존 영화상세 정보 초기화
			for(var i=0;i<movies.length;i++){
				movieList.push(movies[i].title);
				movieDetail[movies[i].title] = {director:movies[i].director};
			}
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
			
		})
	}else{ // 영화정보 수정 API (만일 해당 영화가 없으면 영화 정보 추가)
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		
		var body='';
		req.on('data',function(chunk){body+=chunk;});
		req.on('end',function(){
			var movie = querystring.parse(body);
			if(movieDetail[itemName]){ // 기존의 영화 정보가 있을 경우
				movieDetail[itemName].director = movie.director;
			}else{ // 영화정보가 없을 경우
				movieList.push(itemName);
				movieDetail[itemName] = {director : movie.director};
			}
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieDetail:movieDetail}));
		});
	}
}

function handleDeleteRequest(req,res){
	if(req.url == '/movies'){ // 전체목록 삭제
		movieList = [];
		movieDetail = {};
		res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
		res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
	}else{ // 특정 영화 정보 삭제 API
		
		var itemName = req.url.split('/')[2]; // 3번째를 꺼내지 2번째까지 짜르기
		itemName = urlencode.decode(itemName); // URL디코딩
		
		if(movieDetail[itemName]){
			var index = movieList.indexOf(itemName);
			if(index != 1) movieList.splice(index,1); // 배열에서 영화 이름 제거
			delete movieDetail[itemName]; // 영화 상세 정보 제거
			res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
			res.end(JSON.stringify({result:true,movieList:movieList,movieDetail:movieDetail}));
		}else{
			res.statusCode = 404; res.end("Wrong movie name");
		}
		
	}
}


