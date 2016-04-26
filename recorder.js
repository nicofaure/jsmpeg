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

      var bufferSize = 16384;
      recorder = context.createScriptProcessor(bufferSize, 4, 4);

      recorder.onaudioprocess = function(e){
        if(!recording) return;
        
        var left = e.inputBuffer.getChannelData(0);
        console.log(left);
        window.Stream.write(left);
      }

      audioInput.connect(recorder)
      recorder.connect(context.destination); 
    }

  });
})(this);
