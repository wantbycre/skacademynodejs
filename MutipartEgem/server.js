/**
 * server.js
 */

var formidable = require('formidable'); // 반드시 지역 선언해줘야함
var http = require('http');
var fs = require('fs');
var paints = [];
var server = http.createServer(function(req,res){
	if(req.url == '/list' && req.method == 'GET'){
		var html = '<html><head><meta charset="UTF-8"></head>"';
			html += '<body><h1>Favorite Paint</h1><ul>';
			for(var i =0;i<paints.length;i++){
				html+= '<li><img src="http://127.0.0.1:3000/'+paints[i].image_url+'">'+paints[i].title+'</li>';
			}
			html += '</ul><br>';
			html += '<form method="POST" action="/upload" enctype="multipart/form-data">';
			html += '작품이름:<input type="text" name="title">';
			html += '<br><input type="file" name="file">';
			html += '<br><input type="submit" value="upload"></form></body></html>';
			res.end(html);
	}else if(req.url == '/upload' && req.method == 'POST'){
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		form.keepExtension = true;
		form.uploadDir = './upload';
		form.parse(req,function(err,fields,files){
			var File = files.file;
			var filename = File['path']; // 파일명 추출
			filename = filename.replace(/\\/gm,'/'); // 역슬래시를 슬래스로 변경
			paints.push({title:fields.title,image_url:filename}); // 배열에 추가
			res.statusCode = 302; // 리스트 페이지로 리다이렉션
			res.setHeader('Location','/list');
			res.end();
		});
	}else{
		var path = __dirname + req.url;
		fs.exists(path, function(exist){
			if(exist){
				res.writeHeader(200,{'Content-Type':'image/*'});
				fs.createReadStream(path).pipe(res);
			}else{
				res.statusCode = 404; res.end('Not Found');
			}
		})
	}
	
});
server.listen(3000);