(function() {
  var FileDropzone = Vue.extend({
    template:
      '<div class="file-dropzone" @dragover="dragover" @drop="drop" @dragenter="dragenter" @dragleave="dragleave" :class="{\'hovered\': hovering}">'+
      '  <slot></slot>'+
      '  <div class="overlay">'+
      '    <div class="dropzone-message">'+
      '      <p>ドロップしてアップロード</p>'+
      '      <p><img src="../images/photo.png"></p>'+
      '    </div>'+
      '  </div>'+
      '</div>',
    data: function() {
      return {
        hovering: false,
        /** HACK: 子要素があるとDrag eventが何重にも呼ばれる */
        innerFlag: false
      };
    },
    methods: {
      dragover : function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        this.innerFlag = false;
      },
      drop: function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.hovering = false;
        var files = e.dataTransfer.files;

        for(var i = 0; i < files.length; i++) {
          this.dispatchSelectFile(files[i]);
        }
      },
      dragenter: function(e) {
        this.innerFlag = true;
        this.hovering = true;
        e.preventDefault();
      },
      dragleave: function(e) {
        if (this.innerFlag) {
          this.innerFlag = false;
          return;
        }
        this.hovering = false
        e.preventDefault();
      },
      /** 選択したファイルをアプリに通知 */
      dispatchSelectFile: function(blob) {
        this.$dispatch('select-file', blob);
      }
    }
  });

  Vue.component('file-dropzone', FileDropzone);
})();
