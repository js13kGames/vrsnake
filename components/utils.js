/* global AFRAME */

// modified from https://github.com/ngokevin/kframe
AFRAME.registerComponent("entity-generator", {
  schema: {
    mixin: { default: "" },
    num: { default: 15 }
  },

  init: function() {
    // Create entities with supplied mixin.
    for (var i = 0; i < this.data.num; i++) {
      var entity = document.createElement("a-entity");
      entity.setAttribute("mixin", this.data.mixin);
      entity.setAttribute("class", this.data.mixin);
      this.el.appendChild(entity);
    }
  }
});

// modified from https://github.com/ngokevin/kframe
AFRAME.registerComponent("random-position", {
  schema: {
    min: { default: { x: -20, y: -20, z: -20 }, type: "vec3" },
    max: { default: { x: 20, y: 20, z: 20 }, type: "vec3" },
    step: { default: 2.5, type: "number" },
    fixedY: { type: "number" }
  },

  update: function() {
    var max = this.data.max;
    var min = this.data.min;
    var step = this.data.step;
    var posY =
      this.data.fixedY !== undefined
        ? this.data.fixedY
        : Math.floor(Math.random() * ((max.y - min.y) / step)) * step + min.y;

    this.el.setAttribute("position", {
      x: Math.floor(Math.random() * ((max.x - min.x) / step)) * step + min.x,
      y: posY,
      z: Math.floor(Math.random() * ((max.z - min.z) / step)) * step + min.z
    });
  }
});
