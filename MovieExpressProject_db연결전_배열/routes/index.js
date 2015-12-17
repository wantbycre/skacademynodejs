
/*
 * GET home page.
 */

//var http = require('http');
var request = require('request');
exports.index = function(req, res){
	request('http://127.0.0.1:3000/movies' , function(error,response,body){
		if(!error && response.statusCode == 200){
			res.render('index',{title:'Movie List',
				movies:JSON.parse(body) });			
		}else{
			res.statusCode = 404; res.end('Wrong movie name');
		}		
	})	  
};