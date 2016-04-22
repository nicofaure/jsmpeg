var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint', port:3702});
var binaryVideoServer = new BinaryServer({server: server, path: '/video-endpoint', port:4702});
var binaryAudioServer = new BinaryServer({server: server, path: '/audio-endpoint', port:4703});
var base64 = require('base64-stream');
var Stream = require('stream');
var redis = require("redis");

var publisher = redis.createClient();
var subscriber = redis.createClient();
var videoPublisher = redis.createClient();
var videoSubscriber = redis.createClient();

subscriber.subscribe("channel0");
videoSubscriber.subscribe("video");


binaryVideoServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, meta) {
    console.log('>>>Incoming Video stream');
    stream.on("data",function(chunk){
      videoPublisher.publish("video",chunk.toString('base64'));
    });

    stream.on('end', function() {
      console.log('||| Video stream ended');
    });

    videoSubscriber.on("message", function(channel, data) {
      var responseStream = client.createStream('fromserver');
      var bufferStream = new Stream();
      bufferStream.pipe(responseStream);
      bufferStream.emit('data',new Buffer(data,'base64'));
    }); 
    
  }); //client.on
}); //binaryserver.on





binaryserver.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, meta) {
    console.log('>>>Incoming audio stream');
    stream.on("data",function(chunk){
      publisher.publish("channel0",chunk.toString('base64'));
    }); 

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });
    
  });
  
}); 

binaryAudioServer.on('connection', function(client){
  console.log(">>>Incoming audio client");
  subscriber.on("message", function(channel, data) {
    console.log("data received");

    var send = client.createStream();
    var bufferStream = new Stream();
    bufferStream.pipe(send);
    bufferStream.emit('data',new Buffer(data,'base64'));
    
  }); 

});

server.listen(3701);
