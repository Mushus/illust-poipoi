var storage = new Storage();

var hintMessages = [
  'マナーを守ってポイポイしよう！',
  '他の人が不快に思う画像は「不適切な内容を含む画像として設定」しよう！',
  '画像はアップロードは最大4つまで！',
  '「PNG/JPEG/WebP」形式がアップロードできるよ。',
  '「ドラッグ&ドロップ」で画像をアップロードしよう！',
  'ツイート入力欄にコピペで画像を貼れるよ。',
  'Twitterのアカウントを複数登録して切り替えてみよう！',
  '画像サイズは5MBまでだよ。',
  'メニューのアイコンを右クリックして「オプション」！',
  '絵描いてる～？',
  'Twitterは20時が一番見てる人が多いらしいよ。',
];

var app = new Vue({
  el: '#app',
  data: {
    users: [],
    tweetText: "",
    sensitive: false,
    selectedUserId: 0,
    sending: false,
    imageNum: 0,
    poipoiMode: false,
    message: {
      text: "",
      timer: null
    },
    validation: {
      users: true,
      images: true,
      tweetText: true,
      hasStatus: false
    },

  },
  watch: {
    users: function(val) {
      this.validation.users = val || val.length != 0;
    },
  },
  ready: function() {
    Storage.loadAll((data) => {
      this.tweetText      = data[FixedPhraseStorage.StorageKey];
      this.users          = data[UserStorage.StorageKey];
      this.sensitive      = data[SensitiveStorage.StorageKey];
      this.selectedUserId = data[SelectedUserIdStorage.StorageKey];
      this.poipoiMode     = data[PoipoiModeStorage.StorageKey];

      this.$watch('sensitive', (val) => Storage.save(SensitiveStorage.StorageKey, val))
      this.$watch('selectedUserId', (val) => Storage.save(SelectedUserIdStorage.StorageKey, val))
    });

    if (!(this.users || this.users.length != 0)) {
      this.validation.users = false;
    }

    this.rollingMessage();
  },
  computed: {
    isValid: function() {
      for (var i in this.validation) {
        if (!this.validation[i]) return false;
      }
      return true;
    }
  },
  methods: {
    /** メッセージを20秒ごとに置き換える */
    rollingMessage: function() {
      var message;
      do {
        message = hintMessages[hintMessages.length * Math.random() | 0];
      } while(this.message.text == message);
      this.message.text = message;
      this.message.timer = setTimeout(() => this.rollingMessage(), 20000);
    },
    validateImages: function(images) {
      this.imageNum = images.length;
      this.validation.iamges = this.imageNum <= 4;
      this.validation.hasStatus = this.imageNum > 0 || this.tweetText.length > 0;
    },
    validateTweetText: function(tweet) {
      this.validation.tweetText = tweet.length <= 140;
      this.validation.hasStatus = this.imageNum > 0 || this.tweetText.length > 0;
    },
    selectImage: function(blob) {
      switch (blob.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/webp':
          this.$refs.images.addImage(blob);
          break;
        default:
          this.$refs.notification.addMessage('対応していないファイル形式です。\nタイプ: ' + blob.type, true);
          return;
      }
      // SelectImageは1画像しか対応してない→複数来る可能性があるから遅延実行する
      if (this.poipoiMode) setTimeout(() => this.tweet(), 100);
    },
    tweet: function() {
      var self = this;
      this.sending = true;
      var user = this.$refs.userSelector.getSelectedUser();
      var blobs = this.$refs.images.getBlobList();
      var text = this.tweetText;
      var sensitive = this.sensitive;

      // アップロード処理
      var uploadPromise = [];
      blobs.forEach(function(blob) {
        uploadPromise.push((function(blob) {
          return new Promise(function(resolve) {
            user.twitter.uploadMediaWithBlob(blob, function(result) {
              var mediaId = result.media_id_string;
              resolve(mediaId);
            });
          });
        })(blob));
      });

      Promise
      .all(uploadPromise)
      .then(function(mediaIdList) {
        return new Promise(function(resolve, reject) {
          var mediaIds = mediaIdList.join(',');
          if (mediaIds != "") {
            user.twitter.tweetWithMedia(text, mediaIds, sensitive, resolve, reject);
          } else {
            user.twitter.tweet(text, resolve, reject);
          }
        });
      })
      .then(function() {
        return new Promise(function(resolve) {
          self.$refs.notification.addMessage("ツイートしました！", false);
          self.message.text = "『 ぽいぽい！ 』";
          clearTimeout(self.message.timer);
          self.message.timer = setTimeout(() => this.rollingMessage(), 20000);
          self.sending = false;
          self.tweetText = "";
          self.$refs.images.clearList();
          resolve();
        });
      })
      .catch(function(message) {
        self.$refs.notification.addMessage('アップロードに失敗しました:\n' + message, true);
        self.sending = false;
      });
    }
  }
});
