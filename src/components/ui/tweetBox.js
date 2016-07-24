(function() {
  var TweetBox = Vue.extend({
    template:
      '<div class="tweet-box">'+
      '<textarea v-model="text" @paste="paste" placeholder="今なにしてる？" autofocus></textarea>'+
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
      }
    },
    watch: {
      text: function(val) {
        this.textLimit = 140 - this.text.length;
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
        } else {

        }
      },
      /** 選択したファイルをアプリに通知 */
      dispatchSelectFile: function(blob) {
        this.$dispatch('select-file', blob);
      }
    }
  });

  Vue.component('tweet-box', TweetBox);
})();
