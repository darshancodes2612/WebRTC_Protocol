'use strict';   //ensuring data privacy and security

var os = require('os');
var express = require('express');
const app = express();
var obj = express();
var http = require('http');     //generation of http server

app.set('view engine', 'ejs');

//signalling process for RTC in webrtc 
var socketIO = require('socket.io');

obj.use(express.static('public'))

//Define a route 
obj.get("/",function(req,res){
    res.render("index.ejs");
});
var server = http.createServer(obj);
server.listen(process.env.PORT || 8000);

var io = socketIO(server);

io.sockets.on('connection',function(socket){
    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
      }
      
      socket.on('message', function(message,room){
        console.log('Client text',message);
        socket.to(room).emit('message',message,room);
      });

      socket.on('create or join', function(room){
        console.log("request recieved to join or create a room"+room);
        
        //variables for clients in room (aka cir)
        var cir = io.sockets.adapter.rooms[room];
        if(cir){
            var numClients = Object.keys(cir.sockets).length;
        }else{
            numClients = 0;
        }
        console.log("ROOM ="+room+"Client number"+numClients);

        if(numClients ===0){
            socket.join(room);
            console.log('Client id'+socket.id+'created room'+room);
            socket.emit('created',room,socket.id);
        }
        else if(numClients ===1){
            console.log('Client id'+socket.id+'joined room'+room);
            io.sockets.to(room).emit('join',room);
            socket.join(room);
            socket.emit('joined',room,socket.id);
            io.socket.to(room).emit('ready');
        }
        else{
            socket.emit("full",room);
        }
      });

      socket.on('ipaddr', function() {
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
          ifaces[dev].forEach(function(details) {
            if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
              socket.emit('ipaddr', details.address);
            }
          });
        }
      });

      socket.on("bye",function(){
        console.log("bye bye");
      });
});