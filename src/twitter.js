/*
  http://blog.tomatomax.net/archives/2696
*/
TwitterAPI = function() {
  this.appConfig = {
    requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
    authorizeUrl: 'https://api.twitter.com/oauth/authorize',
    authorizeLoginUrl: 'https://twitter.com/oauth/authorize',
    accessTokenUrl: 'https://api.twitter.com/oauth/access_token'
  };
  this.consumer = {
    key: 'dBc8sWvxNo0ZHu8qr9cmA5kFi',
    secret: 'aJDGazQFs6ozCJ5BF0Hjl6V7vRLb764YOEzND1bfwK98X6tFJi'
  };
  this.request = {
    token: '',
    tokenSecret: ''
  };
  this.access = {
    token: '',
    tokenSecret: ''
  };
};


TwitterAPI.prototype.getRequestToken = function(callback) {
  var self = this;
  var accessor = {
    consumerSecret: this.consumer.secret,
    tokenSecret: ''
  };

  var message = {
    method: "GET",
    action: this.appConfig.requestTokenUrl,
    parameters: {
      oauth_signature_method: "HMAC-SHA1",
      oauth_consumer_key: this.consumer.key
    }
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);
  var options = {
    type: message.method,
    url: target,
    success: function(d, dt) {
      var params = QueryString.parse(d);
      self.request.token = params['oauth_token'];
      self.request.tokenSecret = params['oauth_token_secret'];
      if (callback) callback(self.appConfig.authorizeUrl + '?oauth_token=' + params['oauth_token']);
    },
  };
  $.ajax(options);
};

TwitterAPI.prototype.getAccessToken = function(pin, callback) {
  var self = this;
  var accessor = {
    consumerSecret: this.consumer.secret,
    tokenSecret: this.request.tokenSecret
  };

  var message = {
    method: "GET",
    action: this.appConfig.accessTokenUrl,
    parameters: {
      oauth_signature_method: "HMAC-SHA1",
      oauth_consumer_key: this.consumer.key,
      oauth_token: this.request.token,
      oauth_verifier: pin
    }
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);
  var options = {
    type: message.method,
    url: target,
    success: function(d, dt) {
      var params = QueryString.parse(d);
      self.access.token = params['oauth_token'];
      self.access.tokenSecret = params['oauth_token_secret'];
      if (callback) callback();
    },
  };
  $.ajax(options);
};

TwitterAPI.prototype.post = function(api, formData, content, callback, errorCallback) {
  var accessor = {
    consumerSecret: this.consumer.secret,
    tokenSecret: this.access.tokenSecret
  };

  var message = {
    method: "POST",
    action: api,
    parameters: {
      oauth_signature_method: "HMAC-SHA1",
      oauth_consumer_key: this.consumer.key,
      oauth_token: this.access.token
    }
  };
  
  for ( var key in content ) {
    message.parameters[key] = content[key];
  }

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);
  var options = {
    type: message.method,
    url: target,
    data: formData,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(d, dt) { callback && callback(d, dt); },
  };
  $.ajax(options).fail((data) => errorCallback && errorCallback());
}

TwitterAPI.prototype.get = function(api, content, callback) {
  var accessor = {
    consumerSecret: this.consumer.secret,
    tokenSecret: this.access.tokenSecret
  };

  var message = {
    method: "GET",
    action: api,
    parameters: {
      oauth_signature_method: "HMAC-SHA1",
      oauth_consumer_key: this.consumer.key,
      oauth_token: this.access.token
    }
  };
  // 送信するデータをパラメータに追加する
  for ( var key in content ) {
    message.parameters[key] = content[key];
  }
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);
  var options = {
    type: message.method,
    url: target,
    dataType: 'json',
    success: function(d, dt) { callback && callback(d, dt); },
  };
  $.ajax(options);
}

TwitterAPI.prototype.tweet = function(text, callback) {
  var formData = new FormData();
  formData.append('status', text);
  this.post('https://api.twitter.com/1.1/statuses/update.json', formData, [], callback);
};

TwitterAPI.prototype.requestAuthorizedUserInfo = function(callback) {
  var content = {};
  this.get('https://api.twitter.com/1.1/account/verify_credentials.json',
  content,
  function(d,dt) {
    var result = {
      id: d.id,
      name: d.name,
      screen_name: d.screen_name,
      profile_image: d.profile_image_url_https
    };
    callback && callback(result);
  });
};

// TwitterAPI.prototype.uploadMediaWithBase64 = function(base64, callback) {
//   var content = {media: base64};
//   this.post('https://upload.twitter.com/1.1/media/upload.json', content, function(result) {
//     callback && callback(result);
//   });
// };

// HACK: 他のはコピペで良かったみたいだけどこれだけ動かないから加工
TwitterAPI.prototype.uploadMediaWithBlob = function(content, callback, errorCallback) {
  var api = 'https://upload.twitter.com/1.1/media/upload.json';

  var formData = new FormData();
  formData.append('media', content);

  var accessor = {
    consumerSecret: this.consumer.secret,
    tokenSecret: this.access.tokenSecret
  };

  var message = {
    method: "POST",
    action: api,
    parameters: {
      oauth_signature_method: "HMAC-SHA1",
      oauth_consumer_key: this.consumer.key,
      oauth_token: this.access.token
    }
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);
  var options = {
    type: message.method,
    url: target,
    data: formData,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(d, dt) { callback && callback(d, dt); },
  };
  $.ajax(options).fail((data) => errorCallback && errorCallback());
}
/***/
TwitterAPI.prototype.tweetWithMedia = function(text, mediaIds, sensitive, callback, errorCallback) {
  var content = [];
  var formData = new FormData();
  formData.append('status', text);
  if (mediaIds != null) content.media_ids = mediaIds;
  if (sensitive != null) content.possibly_sensitive = sensitive;
  this.post('https://api.twitter.com/1.1/statuses/update.json', formData, content, callback, errorCallback);
};

/*
  http://phiary.me/javascript-url-parameter-query-string-parse-stringify/
*/
var QueryString = {
  parse: function(text, sep, eq, isDecode) {
    text = text || location.search.substr(1);
    sep = sep || '&';
    eq = eq || '=';
    var decode = (isDecode) ? decodeURIComponent : function(a) { return a; };
    return text.split(sep).reduce(function(obj, v) {
      var pair = v.split(eq);
      obj[pair[0]] = decode(pair[1]);
      return obj;
    }, {});
  },
  stringify: function(value, sep, eq, isEncode) {
    sep = sep || '&';
    eq = eq || '=';
    var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
    return Object.keys(value).map(function(key) {
      return key + eq + encode(value[key]);
    }).join(sep);
  },
};
