(function() {
  var TweetBox = Vue.extend({
    template:
      '<div class="tweet-box">'+
      '<textarea v-model="text" @paste="paste" @keydown="keydown" placeholder="今なにしてる？" autofocus></textarea>'+
      '<div class="poipoi-mode-message" v-show="poipoiMode"><img src="../images/recycling.png" @dragstart="return false">ポイポイモード！</div>'+
      '<div class="text-limit" :class="{\'overLimit\': textLimit < 0}">{{ textLimit }}</div>'+
      '</div>',
    props: {
      text: {
        type: String,
        twoWay: true
      },
      poipoiMode: {
        type: Boolean,
        default: false
      },
      enableTweetKeyCtrlEnter: {
        type: Boolean,
        default: false
      },
      enableTweetKeyAltEnter: {
        type: Boolean,
        default: false
      },
      countFunc: {
        type: Function,
        default: function(tweet) {
          return 140 - tweet.length;
        }
      }
    },
    watch: {
      text: function(val) {
        this.textLimit = this.countFunc(typeof val == 'string'? val : '');
        this.$dispatch('update', val);
      }
    },
    data: function() {
      return {
        textLimit: 140
      };
    },
    methods: {
      paste: function(e) {
        var dataTransfer = e.clipboardData;

        var items = dataTransfer.items;
        if (items.length != 0) {
          for(var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.kind == "file") {
              this.dispatchSelectFile(item.getAsFile());
            }
          }
        }
      },
      /** 選択したファイルをアプリに通知 */
      dispatchSelectFile: function(blob) {
        this.$dispatch('select-file', blob);
      },

      keydown: function(e) {
        if (this.enableTweetKeyCtrlEnter && e.ctrlKey && e.key == 'Enter') {
          this.$dispatch('tweet');
        }
        if (this.enableTweetKeyAltEnter && e.altKey && e.key == 'Enter') {
          this.$dispatch('tweet');
        }
      }
    }
  });

  Vue.component('tweet-box', TweetBox);
})();
