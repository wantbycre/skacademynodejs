/**
 * RESTClientExam server.js
 */

var http = require('http');
var request = require('request'); // HTTP 클라이언트 입장에서 웹서버에 접속하기 위해 사용

var server = http.createServer(function(req,res){
	if(req.url == '/'){ // 영화 목록 페이지 처리
		var options = {
			hostname : 'localhost',
			port : '3000',
			path : '/movies'
		};
		http.request(options, function(response){
			var data = '';
			response.on('data',function(chunk){data += chunk;});
			response.on('end',function(){
				var html = '<html><body><h1>영화 목록</h1><ul>';
				var movies = JSON.parse(data);
				for(var i=0;i<movies.length;i++){
					//html+= '<li>'+movies[i]+'</li>';
					html+= '<li><a href="/movie/'+movies[i]+'">'+movies[i]+'</li>';
				}
				html += '</ul><h2>영화정보입력</h2>';
				html += '<form method="Post" action="/add/movie">';
				html += '<br>title:<input type="text" name="title">';
				html += '<br>director:<input type="text" name="director">';
				html += '<br><input type="submit" value="add"></body></html>';
				
				res.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
				res.end(html);
			});
			
		}).end();
		
	}else if(req.url == '/add/movie' && req.method == 'POST'){
		var body = '';
		req.on('data',function(chunk){body+=chunk;});
		req.on('end',function(){
			//var parsed = querystring.parse(body); 바디를 파싱할 필요가 없다
			var options = {host:'127.0.0.1',path:'/movies',port:'3000',method:'POST'};
			function readJSONResponse(response){
				var data = '';
				response.on('data',function(chunk){data += chunk;});
				response.on('end',function(){
					//console.log(data);
					//res.writeHead(200,{'Content-Type':'application/json;charset=UTF-8'});
					//res.end(data);
					
					res.statusCode = 302;
					res.setHeader('Location','/')
					res.end();
				});
			}
			var request = http.request(options, readJSONResponse);
			request.write(body);
			request.end();
		})
	}
	
	
})
server.listen(3001);




