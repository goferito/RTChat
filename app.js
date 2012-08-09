var http = require('http');
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

io.sockets.on('connection', function(client){
    console.log("Client connected...");
    
    client.on('message', function(data){
        console.log(data.id + data.msg);
        client.get("nickname", function(err, name){
            client.broadcast.emit("message", {name: name,
                                              id: data.id, 
                                              msg: data.msg});
        });
    });

    client.on('join', function(name){
        client.set('nickname', name);
        console.log(name + ' joined the chat');
        client.broadcast.emit("message", {name: "Status",
                                          id: 0,
                                          msg: "<b>"+name+"</b> is in da house."});
    });

    client.on('partial', function(msg){
        client.get("nickname", function(err, name){
            console.log('partial ' + name + ": " + msg);
            client.broadcast.emit("partial", {name: name,
                                              msg: msg});
        });
    });
});

app.get("/", function(req, res){
    res.render('chat.jade');
});

server.listen(4000);