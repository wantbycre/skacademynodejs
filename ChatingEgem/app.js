
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

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);
var users = []; // 사용자의 목록 관리 배열
var redis = require('redis');
var subscriber = redis.createClient();
var publisher = redis.createClient();

// 12. mongoose 이용해 로그 저장하기
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/test');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var chatlogSchema = new Schema({
	id:ObjectId, log:String, date:String
});
var ChatLogModel = mongoose.model('chatlog', chatlogSchema);

// 마지막 새로운사람들어왔을때 기존 메시지 띄어주기
var chatmsgSchema = new Schema({
	id:ObjectId, message:String, date:String
});
var ChatMsgModel = mongoose.model('chatmsg', chatmsgSchema);

io.sockets.on('connection',function(socket){ // 클라이언트 연결
	console.log('connection');
	
	
	
	// 10. 사용자 입력 텍스트 받는다 
	socket.on('message',function(raw_msg){ // 클라이언트로부터 메시지를 받아서 Redis에게 메시지를 전달
		var msg = JSON.parse(raw_msg);
		var chatMsg = msg.chat_id+':'+msg.message;
		publisher.publish('chat',chatMsg);
		
		// 마지막 새로운사람들어왔을때 기존 메시지 띄어주기
		var chatmsg = new ChatMsgModel();
		chatmsg.message = chatMsg;
		chatmsg.date = new Date();
		chatmsg.save(function(err) {if(err) console.log(err);});
	});
	
	// 3번 클라이언트에서 chat_conn을 받아서 처리
	socket.on('chat_conn' , function(raw_msg){
		console.log('chat_conn:' + raw_msg);
		var msg = JSON.parse(raw_msg);
		var index = users.indexOf(msg.chat_id); // 배열안에 해당ID가 존재하는지 확인
		if(index == -1){ // 기존에 같은 ID 사용자 없음 > 성공
			users.push(msg.chat_id); // 배열에 ID 추가
			socket.emit('chat_join',JSON.stringify(users));
			socket.broadcast.emit('chat_join',JSON.stringify(users));
			
			// 13. connect했을때 로그 넣어보기
			var chatLog = new ChatLogModel();
			chatLog.log = msg.chat_id+'님이 접속했습니다.';
			chatLog.date = new Date();
			chatLog.save(function(err){
				if(err){console.log(err); return;}
				ChatLogModel.find({},function(err,logs){
					socket.emit('socket_evt_logs',JSON.stringify(logs));
					socket.broadcast.emit('socket_evt_logs', JSON.stringify(logs));
				});
			});
			
			// 마지막 새로운사람들어왔을때 기존 메시지 띄어주기
			ChatMsgModel.find({}, function(err,msgs){
				//console.log(JSON.stringify(msgs));
				socket.emit('message_go',JSON.stringify(msgs));
			});
		}else{ // 0이상 같은 ID존재 > 실패
			socket.emit('chat_fail',JSON.stringify(msg.chat_id));
		}
	});
	
	// 9. 기본대기 수신 준비 (// 마지막 새로운사람들어왔을때 기존 메시지 띄어주기 수정함 배열로)
	subscriber.subscribe('chat'); // 메시지 수신 상태(Redis)
	subscriber.on('message' , function(channel,message){ // Redis로 부터 메시지를 받아서 클라이언트에게 메시지 전달
		socket.emit('message_go' , JSON.stringify([{message:message}]));
	});
	
	// 7. 채팅방 나간다 신호오면 서버처리단계
	socket.on('leave' , function(raw_msg){
		console.log('leave:' + raw_msg);
		var msg = JSON.parse(raw_msg);
		if(msg.chat_id != '' && msg.chat_id != undefined){
			var index = users.indexOf(msg.chat_if);
			users.splice(index,1); // 해당 ID를 배열에서 제거
			socket.emit('someone+leaved' , JSON.stringify(users));
			socket.broadcast.emit('someone_leaved',JSON.stringify(users));
			
			// 14. leave 로그도 저장하기
			var chatLog = new ChatLogModel();
			chatLog.log = msg.chat_id+'님이 종료했습니다.';
			chatLog.date = new Date();
			chatLog.save(function(err){
				if(err){console.log(err); return;}
				ChatLogModel.find({},function(err,logs){
					socket.emit('socket_evt_logs',JSON.stringify(logs));
					socket.broadcast.emit('socket_evt_logs',JSON.stringify(logs));
				});
			});
		}
	});
	socket.on('disconnect' , function(){ // 클라이언트 연결 종료
		console.log('disconnected')
	})
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

