/**
 * server.js
 */

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var movies = [
	{
		title:'쥬라기월드', director:'콜린 트레보로우'
	},
	{
		title:'스타워즈', director:'조지 루카스'
	},
	{
		title:'인터스텔라', director:'크리스토퍼 놀란'
	}
];
var server = http.createServer(function(req,res){
	if(req.method == 'GET'){
		if(req.url == '/'){
			res.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
			fs.createReadStream('index.html').pipe(res);			
		}else if(req.url == '/list'){
			var html = '<html><body><h1>Favorite Move</h1><ul>'
				for(var i=0;i<movies.length;i++){
					html += '<li>'+movies[i].title+'('+movies[i].director+')</li>'
				}
				html+= '</ul><h2>새 영화 입력</h2>';
				html+= '<form method="POST" action="/add/movie">';
				html+= '<input type="TEXT" name="title">';
				html+= '<br><input type="TEXT" name="director">';
				html+= '<br><input type="SUBMIT" value="upload">';
				html+= '</form>';
				html+= '</body></html>';
				
				res.writeHead(200,{'Content-Type':'text/html;charset=UTF-8'});
				res.end(html);
			
		}
	}else if(req.method == 'POST'){
		if(req.url == '/add/movie'){
			var body = '';
			req.on('data' , function(chunk){body += chunk;
			});
			req.on('end',function(){				
				movie = querystring.parse(body); // 전달받은 쿼리를 객체를 변환
				movies.push(movie); // 객체를 배열에 추가
				res.statusCode = 302; // list페이지로 리다이렉트
				res.setHeader('Location','/list');
				res.end();				
			});
		}else if(req.url == '/upload'){
			var body = '';
			req.on('data',function(chunk){
				body += chunk;
			});
			req.on('end',function(){
				//console.log(body);
				var parsed = querystring.parse(body);
				//console.log(parsed); 
				res.end(JSON.stringify(parsed));
			});
		}
	}
});
server.listen(3000);
