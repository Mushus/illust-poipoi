(function() {
  var FileSelectButton = Vue.extend({
    template:
      '<label class="file-select-button">'+
      '<input type="file" @change="onFileChange" multiple>'+
      '</label>',
    methods: {
      /** change event */
      onFileChange: function(e) {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;

        // HACK: files is not Array
        for(var i = 0; i < files.length; i++) {
          this.dispatchSelectFile(files[i]);
        }
        // HACK: 選択されている画像と同じ物を再選択してもファイルが変わったとみなされないのでクリアする
        e.target.value="";
      },
      /** 選択したファイルをアプリに通知 */
      dispatchSelectFile: function(blob) {
        this.$dispatch('select-file', blob);
      }
    }
  });

  Vue.component('file-select-button', FileSelectButton);
})();
