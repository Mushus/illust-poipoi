(function() {
  // やむを得ない状況を覗いてユーザを自動選択する
  var onUpdate = function() {
    if (!this.getSelectedUser() && this.users.length > 0) {
      this.selected = "" + this.users[0].id;
    }
  }

  var UserSelector = Vue.extend({
    template:
      '<div class="user-selector">'+
      '  <div v-if="users.length == 0">'+
      '    <p>まだアカウントを登録してないようです。<a href="./option.html">オプション</a></p>'+
      '  </div>'+
      '  <div v-else>'+
      '    <label v-for="user in users" class="list-user">'+
      '      <input type="radio" v-model="selected" :value="\'\'+user.id">'+
      '      <img :src="user.profileImageUrl" class="user-profile-image" :alt="user.screenName">'+
      '    </label>'+
      '  </div>'+
      '</div>',
    props: {
      users: {
        type: Array,
      },
      selected: {
        type: String,
      }
    },
    ready: onUpdate,
    watch: {
      users: onUpdate,
      selected: onUpdate
    },
    methods: {
      getSelectedUser: function() {
        for(var i in this.users) {
          if (+this.selected == this.users[i].id) {
            return this.users[i];
          }
        }
        return null;
      }
    }
  });

  Vue.component('user-selector', UserSelector);
})();
