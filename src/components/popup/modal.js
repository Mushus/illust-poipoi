(function() {
  var Modal = Vue.extend({
    template:
      '<div class="modal" v-show="showFlag">'+
      '  <div class="modal-mask" @click="clickOutside()">'+
      '    <div class="modal-container">'+
      '      <div class="modal-header">'+
      '        <div class="modal-user-header">'+
      '          <slot name="header"></slot>'+
      '        </div>'+
      '        <div class="modal-close-button" v-show="closeButton">'+
      '          <button type="button" @click="close()">×</button>'+
      '        </div>'+
      '      </div>'+
      '      <div class="modal-body">'+
      '        <slot name="body"></slot>'+
      '      </div>'+
      '      <div class="modal-footer">'+
      '        <slot name="footer"></slot>'+
      '      </div>'+
      '    </div>'+
      '  </div>'+
      '</div>',
    props: {
      closeButton: {
        type: Boolean,
        default: true
      },
      clickOutsideToClose: {
        type: Boolean,
        default: true
      }
    },
    data: function() {
      return {
        showFlag: false
      };
    },
    methods: {
      open: function() {
        this.showFlag = true;
      },
      close: function() {
        if (!this.showFlag) return;
        this.showFlag = false;
        this.$dispatch('close-modal');
      },
      clickOutside: function() {
        if (this.clickOutsideToClose) {
          this.close();
        }
      }
    }
  });

  Vue.component('modal', Modal);
})();
