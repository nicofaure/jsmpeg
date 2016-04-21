var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint', port:3702});


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
          console.log(stream);
          stream.pipe(send);
        } // if (otherClient...
      } // if (binaryserver...
    } // for (var id in ...

    stream.on('end', function() {
      console.log('||| Audio stream ended');
    });
    
  }); //client.on
}); //binaryserver.on

server.listen(3701);