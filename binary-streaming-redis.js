var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint', port:3702});
var base64 = require('base64-stream');
var Stream = require('stream');
var redis = require("redis");

var publisher = redis.createClient();
var subscriber = redis.createClient();

subscriber.subscribe("channel0");


binaryserver.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, meta) {
    console.log('>>>Incoming audio stream');
    console.log(meta);
    // broadcast to all other clients
    for(var id in binaryserver.clients){
      if(binaryserver.clients.hasOwnProperty(id)){
        otherClient = binaryserver.clients[id];
        if(otherClient != client){
          var send = otherClient.createStream(meta);
          stream.on("data",function(chunk){
            publisher.publish("channel0",chunk.toString('base64'));
          });
        } 
      } 
    } 

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });

    subscriber.on("message", function(channel, data) {
      console.log(data);
      for(var id in binaryserver.clients){
        if(binaryserver.clients.hasOwnProperty(id)){
          var otherClient = binaryserver.clients[id];
          if(otherClient != client){
            var send = otherClient.createStream(meta);
            var bufferStream = new Stream();
            bufferStream.pipe(send);
            bufferStream.emit('data',new Buffer(data,'base64'));
          } 
        } 
      } 
    }); 
    
  });
  

}); 

server.listen(3701);
