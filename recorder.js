(function(window) {
  console.log("START!")
  var client = new BinaryClient('ws://localhost:4702/audio-server');

  client.on('open', function() {
    var channel = getParameterByName('channel');
    window.Stream = client.createStream(channel);

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, success, function(e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording = false;

    window.startRecording = function() {
      recording = true;
    }

    window.stopRecording = function() {
      recording = false;
      window.Stream.end();
    }

    function success(e) {
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext();

      // the sample rate is in context.sampleRate
      audioInput = context.createMediaStreamSource(e);

      var bufferSize = 4096;
      recorder = context.createScriptProcessor(bufferSize, 2, 2);

      recorder.onaudioprocess = function(e){
        if(!recording) return;
        
        var left = e.inputBuffer.getChannelData(0);
        console.log(left);
        //ws.send(bufferAsString);
        window.Stream.write(left);

        //testSound(left);
      }

      function testSound(buff) {
        console.log(buff);
        var node = context.createBufferSource()
            , buffer = context.createBuffer(1, bufferSize, context.sampleRate)
            , data = buffer.getChannelData(0);
        var src = context.createBufferSource();
        src.buffer = context.createBuffer(1, buff.byteLength, context.sampleRate)
        src.connect(context.destination);
        node.buffer = buffer;
        node.loop = false;
        for (var i = 0; i < buff.byteLength; i++) {
                data[i] = buff[i];
        }

        node.connect(context.destination);
        node.start(0);
   
    }

      audioInput.connect(recorder)
      recorder.connect(context.destination); 
    }

    function convertFloat32ToInt16(buffer) {
      l = buffer.length;
      buf = new Int16Array(l);
      while (l--) {
        buf[l] = Math.min(1, buffer[l])*0x7FFF;
      }
      return buf.buffer;
    }
  });
})(this);
