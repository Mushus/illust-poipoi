var storage = new Storage();

var app = new Vue({
  el: '#app',
  data: {
    /** ユーザー情報 */
    users: [],
    /** 認証開始してるかどうか */
    isStartedAuth: false,
    /** 新しく追加するユーザー */
    newUser: null,

    tweetText: "",

    poipoiMode: false,

    validation: {
      tweetText: true,
    }
  },
  ready: function() {
    Storage.loadAll((data) => {
      this.users          = data[UserStorage.StorageKey];
      this.poipoiMode     = data[PoipoiModeStorage.StorageKey];
      this.tweetText      = data[FixedPhraseStorage.StorageKey];

      this.$watch('users', (val) => Storage.save(UserStorage.StorageKey, val), {deep:true})
      this.$watch('poipoiMode', (val) => Storage.save(PoipoiModeStorage.StorageKey, val))
      this.$watch('tweetText', (val) => Storage.save(FixedPhraseStorage.StorageKey, val))
    });
  },
  events: {
    'click-add-user-button': function() {
      this.openModal();
      return false;
    }
  },
  methods: {
    validateTweetText: function(tweet) {
      this.validation.tweetText = tweet.length <= 140;
    },
    /** モーダルを開く */
    openModal: function() {
      this.$refs.modal.open();
      this.isStartedAuth = false;
    },
    /** モーダルを閉じる */
    closeModal: function() {
      this.$refs.modal.close();
      this.newUser = false;
      this.isStartedAuth = false;
    },
    /** 承認する */
    goAuthTwitter: function() {
      var self = this;
      this.isStartedAuth = true;
      /** 自身のタブを */
      var getMyTabId = function() {
        return new Promise(function(resolve) {
          chrome.tabs.getCurrent(function(tab) {
            resolve(tab);
          });
        });
      };
      /** URLを生成 */
      var createUrl = function(twitter) {
        return new Promise(function (resolve, reject) {
          try {
            twitter.getRequestToken(resolve);
          } catch(e) {
            reject('Invalid response.');
          }
        });
      };

      /** タブを作る */
      var openTab = function(url) {
        return new Promise(function(resolve) {
          chrome.tabs.create({url: url}, resolve);
        });
      };

      /** ピンを取得しに行く */
      var requestPin = function(twitter, tab) {
        var visitedAuthPage = false;
        return new Promise(function(resolve, reject) {
          var eventFunc = function(tabId, changeInfo, Tab) {
            if (tabId != tab.id) return;
            if (changeInfo.status == 'loading' &&
              (changeInfo.url == twitter.appConfig.authorizeUrl ||
              changeInfo.url == twitter.appConfig.authorizeLoginUrl)) {
              // 承認ページに訪れた
              visitedAuthPage = true;
            } else if (changeInfo.status == 'complete' && visitedAuthPage) {
              // ページを表示完了した
              resolve(tab);
            } else if (visitedAuthPage && changeInfo.status == 'loading') {
              // ページに来たのに他事した
              removeEvent();
              reject('Authentication page don\'t load correctly.');
            }
          };
          /** 開いたタブが閉じられたらエラー */
          var closeEventFunc = function(tabId, removeInfo) {
            if (tabId != tab.id) return;
            removeEvent();
            reject('Twitter Authentication window is closed.');
          };

          /** イベント削除用 */
          var removeEvent = function() {
            // TODO: 途中で中断するとイベントが残ったままになるので治す
            chrome.tabs.onUpdated.removeListener(eventFunc);
            chrome.tabs.onRemoved.removeListener(closeEventFunc);
          };
          chrome.tabs.onRemoved.addListener(closeEventFunc);
          chrome.tabs.onUpdated.addListener(eventFunc);
        });
      };

      /** ピンを取得する */
      var getPin = function(tab) {
        return new Promise(function(resolve, reject) {
          var script = {
            code: 'document.querySelector(\'#oauth_pin code\').innerText'
          };
          chrome.tabs.executeScript(tab.id, script, function(result) {
            if (result[0] != null) {
              resolve(result[0]);
            } else {
              reject('Failed to get the PIN code.');
            }
          });
        });
      };

      /** アクセストークンを取得する */
      var getAccessToken = function(twitter, pin) {
        return new Promise(function(resolve, reject) {
          twitter.getAccessToken(pin, function () {
            resolve(twitter);
          });
        });
      };

      /** タブに戻る */
      var returnTab = function(myTab, authTab) {
        return Promise.all([
          new Promise(function(resolve) {
            chrome.tabs.highlight({tabs: [myTab.index], windowId: myTab.windowId}, resolve);
          }),
          new Promise(function(resolve) {
            chrome.tabs.remove([authTab.id], resolve);
          })
        ]);
      };

      /** エラーハンドリング */
      var errorHandling = function(message) {
        return new Promise(function(resolve, reject) {
          this.isStartedAuth = false;
          alert('認証エラーが発生しました:\n' + message);
        });
      };

      var finish = function(result) {
        return new Promise(function(resolve) {
          var twitterApi = result[0];
          self.createUser(twitterApi);
        });
      };

      (function() {
        var twitter = new TwitterAPI();
        getMyTabId()
        .then(function(myTab) {
          return createUrl(twitter)
          .then(openTab)
          .then(function(authTab){
            return requestPin(twitter, authTab)
            .then(getPin)
            .then(function(pin) {
              return Promise.all([
                getAccessToken(twitter, pin),
                returnTab(myTab, authTab)
              ]);
            })
          })
        })
        .then(finish)
        .catch(errorHandling);
      })();
    },

    /** ユーザーを生成する */
    createUser: function(twitterApi) {
      var self = this;
      var user = new User();
      this.newUser = user;

      user.updataByTwitter(twitterApi);
    },

    isValidNewUser: function() {
      return this.newUser && !this.newUser.isLoading();
    },

    registerUser: function() {
      // HACK: 要素のv-refにケバブケースで書くとキャメルケースに変換される
      this.$refs.userList.addUser(this.newUser);
      this.closeModal();
    }
  },

});
