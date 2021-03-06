/* global AFRAME THREE */

AFRAME.registerComponent("wasd-relative", {
  schema: {
    speed: { default: 2.5, type: "number" }
  },

  dependencies: ["snake-controller"],

  init: function() {
    this.newVelocity = new THREE.Vector3(this.data.speed, 0, 0); // reusable vector
    this.down = false; // used to prevent repetitive keydowns
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    this.el.sceneEl.emit("changemomentum", this.newVelocity);
  },

  onKeyDown: function(e) {
    if (this.down) return;
    this.down = true;
    const rotate = function(vec, rad) {
      // rotate about x-z plane
      const x = vec.x * Math.cos(rad) - vec.z * Math.sin(rad);
      const z = vec.x * Math.sin(rad) + vec.z * Math.cos(rad);
      return { x, y: vec.y, z };
    };

    let rotated = {};
    switch (e.keyCode) {
    case 37:
    case 65: // left
      rotated = rotate(this.newVelocity, -Math.PI / 2);
      break;
    case 39:
    case 68: // right
      rotated = rotate(this.newVelocity, Math.PI / 2);
      break;
    default:
      return;
    }
    this.newVelocity.set(rotated.x, rotated.y, rotated.z);
    this.el.sceneEl.emit("changemomentum", this.newVelocity);
  },

  onKeyUp: function() {
    this.down = false;
  }
});
