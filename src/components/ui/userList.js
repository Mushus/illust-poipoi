(function() {
  var UserList = Vue.extend({
    template:
      '<div class="user-list">'+
      '  <div v-if="isEmpty()" class="message-empty">'+
      '    {{ emptyUserMessage }}'+
      '  </div>'+
      '  <div v-else>'+
      '    <div v-for="user in users" class="listed-user">'+
      '      <div class="remove-button"><button type="button" @click="removeUser($index)">×</button></div>'+
      '      <img :src="user.profileImageUrl" class="user-profile-image">'+
      '      <div class="user-screen-name">{{ user.screenName }}</div>'+
      '      <div class="user-name">{{ user.name }}</div>'+
      '    </div>'+
      '  </div>'+
      '  <button type="button" @click="clickAddUserButton()">追加する</button>'+
      '</div>',
    props: {
      emptyUserMessage: {
        type: String,
      },
      users: {
        type: Array,
        twoWay: true
      }
    },
    events: {
      'close': function() {}
    },
    methods: {
      isEmpty: function() {
        return !this.users || this.users.length == 0;
      },
      addUser: function(user) {
        for(var key in this.users) {
          if (this.users[key].id == user.id) {
            return;
          }
        }
        this.users.push(user);
      },
      removeUser: function(index) {
        if (confirm('削除してよろしいですか？')) {
          this.users.splice(index, 1);
        }
      },
      clickAddUserButton: function() {
        this.$dispatch('click-add-user-button');
      }
    }
  });

  Vue.component('user-list', UserList);
})();
