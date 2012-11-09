var http = require('http');
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
var path = require("path");
var users = [];

app.configure(function(){
    app.use(express.static(path.join(__dirname, 'public')));
});

io.sockets.on('connection', function(client){
  console.log("Client connected...");
  
  client.on('message', function(data){
    console.log(data.id + data.msg);
    client.get("nickname", function(err, name){
        client.broadcast.emit("message", {name: name,
                                          msg: data.msg});
    });
  });

  client.on('join', function(name){
    console.log(users);
    client.set('nickname', name);
    for (var i=0; i<users.length; i++){
      client.emit('status', {name: users[i],
                            status: 'connected'});
    }
    users.push(name);
    console.log(name + ' joined the chat');
    client.broadcast.emit('status', {name: name,
                                     status: 'connected'});
  });

  client.on('partial', function(msg){
    client.get("nickname", function(err, name){
        console.log('partial ' + name + ": " + msg);
        client.broadcast.emit("partial", {name: name,
                                          msg: msg});
    });
  });

  client.on('disconnect', function(){
    client.get('nickname', function(err, name){
      client.broadcast.emit('status', {name: name,
                                       status: 'disconnect'});
      users.splice(users.indexOf(name),1);
      console.log(name+' is disconnected');
    });
  });
});

app.get("/", function(req, res){
    res.render('chat.jade');
});

server.listen(4000);
