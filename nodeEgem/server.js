/**
 * server.js
 * 2015-12-14
 */

var url = require('url');
var urlStr = 'http://idols.com/q?group=EXID&name=하니&since=';
var parsed = url.parse(urlStr, true);
console.log(parsed);
console.log('protocol:',parsed['protocol']);
console.log('host',parsed.host);

var querystring = require('querystring');
var str = parsed.search;
str = str.substring(1);
str += '&group=LOVELOY';
var queryParsed = querystring.parse(str);
console.log('group:'+queryParsed.group);
console.log('name:'+queryParsed.name);
console.log(queryParsed);

var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req,res){ // 클라이언트가 request할때호출
	var parsed = url.parse(req.url, true);
	if(req.url == '/'){
		res.writeHead(200,{'Content-Type':'text/html; charset=UTF-8'});
		res.end('<html><body><h1>Hello World!</h1>'+
				'<img src="images/ck.jpg"></body></html>');
		return;
		
	}else if(parsed.pathname == '/count'){
		var start = parsed.query.start;
		var end = parsed.query.end;
		console.log(start+','+end);
		var sum = 0;
		for(var i = Number(start); i <= Number(end); i++) sum +=i;
		res.end('result = '+sum);
		return;		
	}
	
	var path = __dirname + req.url; // c:\\workspace\\httexam + /images/ck.jpg
	console.log('path:'+path);
	fs.exists(path, function(exist){// 해당이미지파일이 존재하는지 확인
		if(exist){// 이미지 파일이 존재할경우
			res.writeHead(200,{'Content-Type':'image/*'});
			fs.createReadStream(path).pipe(res); // 파일 -> 스트림 -> 클리아언트 전달
		}else{ // 이미지 파일이 존재하지 않을경우
			res.statusCode = 404;
			res.end('Not Found');
		}
	})
	
	/*console.log('version:'+req.httpVertion);
	console.log('method:'+req.method);
	console.log('url:'+req.url);
	console.log('===== headers =====');
	console.log(req.headers);
	
	//res.write('Hello World');
	res.write(JSON.stringify(req.headers));//객체 -> JSON문자열보 
	res.end();*/
	
});

server.listen(3000);
