var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint', port:3702});
var binaryVideoServer = new BinaryServer({server: server, path: '/video-endpoint', port:4702});
var base64 = require('base64-stream');
var Stream = require('stream');


binaryVideoServer.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, meta) {
    console.log('>>>Incoming Video stream');
    console.log(stream);
    var responseStream = client.createStream('fromserver');
    stream.pipe(responseStream);
    stream.on('end', function() {
      console.log('||| Video stream ended');
    });
    
  }); //client.on
}); //binaryserver.on


binaryserver.on('connection', function(client){
  console.log('Binary Server connection started');

  client.on('stream', function(stream, meta) {
    console.log('>>>Incoming audio stream');
    console.log(meta);
    // broadcast to all other clients
    for(var id in binaryserver.clients){
      if(binaryserver.clients.hasOwnProperty(id)){
        var otherClient = binaryserver.clients[id];
        if(otherClient != client){
          var send = otherClient.createStream(meta);
          stream.on("data",function(chunk){
            console.log(chunk.toString('utf8'));
            var bufferStream = new Stream();
            bufferStream.pipe(send);
            bufferStream.emit('data',new Buffer(chunk.toString()));

          });

        } // if (otherClient...
      } // if (binaryserver...
    } // for (var id in ...

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });
    
  }); //client.on
}); //binaryserver.on

server.listen(3701);
