(function() {
  var Notification = Vue.extend({
    template:
      '<div class="notification" v-for="message in messages" track-by="$index">'+
      '  <div class="message" :class="{\'error\': message.isError}">{{ message.text }}</div>'+
      '</div>',
    data: function() {
      return {
        messages: [],
      }
    },
    methods: {
      /** メッセージを追加 */
      addMessage: function(message, isError) {
        var self = this;
        this.messages.push({text: message, isError: isError});
        //6秒後自動的に消える
        setTimeout(function() {
          self.messages.shift();
        }, 5000);
      }
    }
  });

  Vue.component('notification', Notification);
})();
