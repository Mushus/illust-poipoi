class FileData {
  constructor(data, type) {
    this.data = data;
    this.type = type;
  }

  convartDataToBinaryString() {
    return convertUint8ArrayToBinaryString(this.data);
  }

  convartDataToBase64() {
    return btoa(String.fromCharCode.apply(null, this.data));
  }
};

function convertUint8ArrayToBinaryString(u8Array) {
	var i, len = u8Array.length, b_str = "";
	for (i = 0; i < len; i++) {
		b_str += String.fromCharCode(u8Array[i]);
	}
	return b_str;
}

class User {
  constructor() {
    this.twitter          = null;
    this.id               = null;
    this.screenName       = null;
    this.name             = null;
    this.profileImageUrl  = null;
    /** 最終更新日 バグった時にAPI投げまくるの良くないので一応 */
    this.lastModified     = null;
    this.loading          = true;
  }

  updataByTwitter(twitterApi, callback) {
    var twitter;
    if (twitterApi == null) {
      twitter = this.twitter;
    } else {
      twitter = twitterApi;
    }
    this.twitter = twitter;
    this.loading = true;

    twitter.requestAuthorizedUserInfo((userInfo) => {
      this.id               = userInfo.id;
      this.screenName       = userInfo.screen_name;
      this.name             = userInfo.name;
      this.profileImageUrl  = this.biggerImg(userInfo.profile_image);
      this.lastModified     = +new Date();
      this.loading          = false;
      callback && callback(this);
    });
  }

  /** 読込中か調べる */
  isLoading() {
    return this.loading;
  }

  /** 画像を大きいサイズにurlを差し替える */
  biggerImg(url) {
    if (!url) return null;
    if (url) return url.replace(/_[a-z]+\.([a-z]{3,4})/g, '_bigger.$1');
    return url;
  }

  /** 保存してあるデータから変換 */
  fromStorageValue(userVal) {
    var twitter = new TwitterAPI();
    twitter.access.token        = userVal.accessToken;
    twitter.access.tokenSecret  = userVal.accessTokenSecret

    this.twitter          = twitter;
    this.id               = userVal.id;
    this.screenName       = userVal.screenName;
    this.name             = userVal.name;
    this.profileImageUrl  = userVal.profileImageUrl;
    this.lastModified     = userVal.lastModified;
    this.loading          = false;

    return this;
  }

  /** ツイートする */
  tweet(option, callback) {
    var text      = 'text'      in option? option.text      : "";
    var mediaIds  = 'mediaIds'  in option? option.mediaIds  : [];
    var sensitive = 'sensitive' in option? option.sensitive : true;

    let beforeUpdate = (json) => {
      this.profileImageUrl = this.biggerImg(json.user.profile_image_url);
      callback && callback();
    };

    if (mediaIds.length > 0) {
      let delimitedId = mediaIds.join(',');
      this.twitter.tweetWithMedia(text, delimitedId, sensitive, beforeUpdate);
    } else {
      this.twitter.tweet(text, beforeUpdate);
    }
  }

  /** 保存用に変換 */
  toStorageValue() {
    var accessToken = this.twitter? this.twitter.access.token : '';

    return {
      accessToken:        this.twitter? this.twitter.access.token : '',
      accessTokenSecret:  this.twitter? this.twitter.access.tokenSecret : '',
      id:                 this.id,
      screenName:         this.screenName,
      name:               this.name,
      profileImageUrl:    this.profileImageUrl,
      lastModified:       this.lastModified,
    };
  }
}
