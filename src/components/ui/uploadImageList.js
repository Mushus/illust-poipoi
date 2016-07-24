(function() {
  var UploadImageList = Vue.extend({
    template:
      '<div class="upload-image-list">'+
      '<div v-for="image in images" class="image">'+
      '<img :src="image.url" class="upload-image">'+
      '<button type="button" @click="removeImage($index)">×</button>'+
      '</div>'+
      '</div>',
    data: function() {
      return {
        images: []
      };
    },
    methods: {
      addImage: function(blob) {
        var ourl = URL.createObjectURL(blob);
        this.images.push({url: ourl, blob: blob});
        this.$dispatch('update', this.images);
      },
      removeImage: function(index) {
        this.images.splice(index, 1);
        this.$dispatch('update', this.images);
      },
      getBlobList: function() {
        return this.images.map((image) => image.blob);
      },
      clearList: function() {
        this.images = [];
      }
    },
    events: {
    }
  });

  Vue.component('upload-image-list', UploadImageList);
})();
