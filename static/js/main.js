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

  MusicPlayer.prototype.stream = function (track, callback) {
    SC.stream('/tracks/' + track.id, callback);
  };

  MusicPlayer.prototype.embed = function (track, embedDomNode) {
    SC.oEmbed(track.uri, { auto_play: true }, embedDomNode);
  };

  var trackTemplate = '<div class="track"><img src="${artwork_url}" class="track-art" alt="Album art"><span class="track-header">${uploader}: <a href="${permalink_url}">${title}</a></span><p class="track-description">${description}</p></div>';
  MusicPlayer.prototype.renderTrack = function (track) {
    return _.template(trackTemplate, {
      artwork_url: track.artwork_url.replace('large', 't500x500'),
      title: track.title,
      description: track.description.replace(/\n/g, '<br>'),
      uploader: track.user.username,
      permalink_url: track.permalink_url
    });
  };

  return MusicPlayer;
})();

var SpeechRecognizer = (function() {
  function initSpeechRecognition(recognizer) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
      recognition.lang = 'en';
    };
    recognition.onerror = function (err) {
      console.error(err);
    };
    recognition.onresult = (function (event) {
      this.updateTranscript('');
      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          var finalTranscript = event.results[i][0].transcript;
          this.updateTranscript(finalTranscript);
          _.forEach(this.actions, function (handler, action) {
            if (this.parseAction(finalTranscript, action, handler)) {
              this.updateTranscript('');
              return false;
            }
          }, this);
        } else {
          this.updateTranscript(this.transcript + event.results[i][0].transcript);
        }
      }
      _.forEach(this.actions, function (handler, action) {
        if (handler.interim && this.parseAction(this.transcript, action, handler)) {
          this.updateTranscript('');
          return false;
        }
      }, this);
    }).bind(recognizer);
    recognizer._recognition = recognition;
  }

  function SpeechRecognizer(actions, onTranscriptChange) {
    this.actions = actions;
    this.onTranscriptChange = onTranscriptChange;
    this.transcript = '';
    this.listening = false;
    initSpeechRecognition(this);
  }

  SpeechRecognizer.prototype.start = function () {
    if (!this.listening) {
      this._recognition.start();
      this.listening = true;
    }
  };

  SpeechRecognizer.prototype.stop = function () {
    if (this.listening) {
      this._recognition.stop();
      this.listening = false;
    }
  };

  SpeechRecognizer.prototype.restart = function () {
    initSpeechRecognition(this);
    this.listening = false;
    this.start();
  };

  SpeechRecognizer.prototype.updateTranscript = function (newTranscript) {
    this.transcript = newTranscript;
    this.onTranscriptChange(this.transcript);
  };

  SpeechRecognizer.prototype.parseAction = function (text, action, handler) {
    var tokens = text.toLowerCase().split(' ');
    var searchTokens = _.has(handler, 'similar') ? _.clone(handler.similar) : [];
    searchTokens.push(action);
    var foundAction = false;
    _.forEach(searchTokens, function (searchToken) {
      var searchTokenIndex = tokens.indexOf(searchToken.toLowerCase());
      if (searchTokenIndex !== -1 && tokens.length > searchTokenIndex + handler.minLength) {
        handler.callback.bind(this)(tokens.slice(searchTokenIndex+1).join(' '));
        foundAction = true;
        return false;
      }
    }, this);
    return foundAction;
  };

  return SpeechRecognizer;
})();
