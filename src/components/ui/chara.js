(function() {
  var anim = [
     [100,1], [100,2], [100,3], [100,4], [100,5], [100,6], [100,57], [100,8],
     [100,9],[100,10],[100,11],[100,12],[100,13],[100,14],[100,15],[100,16],
    [100,17],[100,18],[100,19],[100,57],[100,21],[100,22],[100,23],[100,24],
    [100,25],[100,26],[100,27],[100,57],[100,29],[100,30],[100,31],[100,32],
    [100,33],[100,57],[100,35],[100,36],[100,37],[100,38],[100,39],[100,40],
    [100,41],[100,57],[100,43],[100,44],[100,45],[100,57],[100,47],[100,48],
    [100,49],[100,57],[100,51],[100,52],[100,57],[100,54],[100,55],[100,56],
    [100,57],[100,58],[100,59],[100,57]
  ];
  var keyframe = [7, 20, 28, 34, 42, 46, 50, 53, 56];

  var Chara = Vue.extend({
    template:
      '<div class="chara" :style="style" @click="onclick">'+
      '</div>',
    data: function() {
      var image = new Image();
      image.src = "../images/chara.png";
      return {
        frame: 0,
        style: "",
        image: image,
        timer: 0
      };
    },
    watch: {
      frame: function(val) {
        var posx = -val * 48;
        this.style = "cursor:pointer;width:48px;height:48px;background-size:2880px;"+
            "background-image:url(" + this.image.src + ");" +
            "background-position:" + posx + "px 0;";
      }
    },
    ready: function() {
      this.nextFrame();
    },
    methods: {
      nextFrame: function() {
        var self = this;
        clearTimeout(this.timer);
        if (this.frame > 56 && Math.random() < 0.1) {
          if (Math.random() < 0.2) {
            this.frame = keyframe[keyframe.length * Math.random() | 0];
          } else {
            this.frame = 53;
          }
        } else {
          this.frame = anim[this.frame][1];
        }
        this.timer = setTimeout(function() {
          self.nextFrame();
        }, anim[this.frame][0]);
      },
      onclick: function() {
        var self = this;
        clearTimeout(this.timer);
        this.frame = keyframe[keyframe.length * Math.random() | 0];
        this.timer = setTimeout(function() {
          self.nextFrame();
        }, anim[this.frame][0]);
      }
    },
    events: {
    }
  });

  Vue.component('chara', Chara);
})();
