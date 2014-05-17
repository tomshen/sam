var MusicPlayer = (function() {
  function MusicPlayer(clientId, redirectUri) {
    SC.initialize({
      client_id: clientId,
      redirect_uri: redirectUri
    });
  }

  // callback(tracks), where tracks is an array of track objects
  MusicPlayer.prototype.search = function (query, callback) {
    SC.get('/tracks', { q: query, filter: 'streamable' }, callback);
  };

  MusicPlayer.prototype.stream = function (track) {
    SC.stream('/tracks/' + track.id, function (sound) {
      sound.play();
    });
  };

  MusicPlayer.prototype.embed = function (track, embedDomNode) {
    SC.oEmbed(track.uri, { auto_play: true }, embedDomNode);
  };

  return MusicPlayer;
})();

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

function parseAction(text, action, callback) {
  var tokens = text.split(' ');
  var searchTokenIndex = tokens.indexOf(action);
  if (searchTokenIndex !== -1 && tokens.length > searchTokenIndex) {
    callback(tokens.slice(searchTokenIndex+1).join(' '));
  }
}
