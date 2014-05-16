function initSpeechRecognition(onresult) {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = function () {
    recognition.lang = 'en';
  };
  recognition.onresult = onresult;
  recognition.onerror = function(err) {
    console.error(err);
  };
  recognition.onend = function() {};
  recognition.start();
  return recognition;
}

var finalTranscript = '';
function onresult(event) {
  var interimTranscript = '';
  for (var i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
      document.getElementById('transcript-final').innerHTML = finalTranscript;
    } else {
      interimTranscript += event.results[i][0].transcript;
      document.getElementById('transcript-interim').innerHTML = interimTranscript;
    }
  }
}

var recognition = initSpeechRecognition(onresult);
