/* global THREE AFRAME */
const calcRotationY = function(source, compare) {
  // find 2d relative rotation in degrees around y axis
  const a2 = Math.atan2(source.z, source.x);
  const a1 = Math.atan2(compare.z, compare.x);
  const sign = a1 > a2 ? 1 : -1;
  const angle = a1 - a2;
  const K = -sign * Math.PI * 2;
  const rotation = Math.abs(K + angle) < Math.abs(angle) ? K + angle : angle;
  return -rotation * (180 / Math.PI); // degree to rad
};

AFRAME.registerComponent("commander", {
  schema: {
    head: { type: "selector" },
    radius: { default: 2.5, type: "number" },
    delay: { default: 1000, type: "number" },
    numStartingBodies: { default: 2, type: "number" }
  },

  init: function() {
    this.beginDelay = this.el.sceneEl.time;
    this.notDead = true;

    // direction, momentum, rotation
    this.dirMomentum = new THREE.Vector3(this.data.radius, 0, 0);
    this.nextMomentum = this.dirMomentum.clone();
    this.headOrientation = 0;
    this.nextOrientation = 0;

    // add head to balls array
    const headPosition = this.data.head.object3D.position;
    this.balls = [
      {
        el: this.data.head,
        posTarget: headPosition.clone()
      }
    ];

    // add 2 bodies
    for (let i = 0; i < this.data.numStartingBodies; i++) {
      const el = this.generateAndAddBall(headPosition);
      this.el.appendChild(el);
    }

    this.changeNextMomentumHandler = this.changeNextMomentumHandler.bind(this);
    this.updateMomentumHandler = this.updateMomentumHandler.bind(this);
    this.gobbledApple = this.gobbledApple.bind(this);
    this.generateAndAddBall = this.generateAndAddBall.bind(this);
    this.hitObstacle = this.hitObstacle.bind(this);

    // register listeners
    this.el.addEventListener("changemomentum", this.changeNextMomentumHandler);
    this.el.addEventListener("gobbled-apple", this.gobbledApple);
    this.el.addEventListener("bad-collision", this.hitObstacle);
  },

  generateAndAddBall: function(pos) {
    // generate
    const newBall = document.createElement("a-entity");
    newBall.setAttribute("mixin", "sphere");
    newBall.setAttribute("position", pos);
    // add to ballArray
    this.balls.push({
      el: newBall,
      posTarget: pos.clone()
    });
    return newBall;
  },

  changeNextMomentumHandler: function(data) {
    // data is {x,y,z}
    const detail = data.detail;
    this.nextMomentum.set(detail.x, detail.y, detail.z);
    this.nextOrientation =
      this.headOrientation + calcRotationY(this.dirMomentum, this.nextMomentum);
  },

  updateMomentumHandler: function(data) {
    // data is a Vector3
    this.dirMomentum.copy(data);
  },

  gobbledApple: function(event) {
    // remove apple
    if (event.detail.classList.contains("apple")) {
      event.detail.parentNode.removeChild(event.detail);
    }
    // add body
    const posLastBall = this.balls[this.balls.length - 1].el.object3D.position;
    const el = this.generateAndAddBall(posLastBall);
    this.el.appendChild(el);
    // TODO: check if won
  },

  hitObstacle: function(event) {
    this.notDead = false;
    const sky = document.querySelector("#sky");
    sky.setAttribute("color", "red");
  },

  tick: function(time, timeDelta) {
    if (this.notDead && time - this.beginDelay >= this.data.delay) {
      // MOVE!
      this.beginDelay = time;
      let balls = this.balls;

      // copy stuff over from end
      for (let i = balls.length - 1; i > 0; i--) {
        balls[i].posTarget.copy(balls[i - 1].posTarget);
      }
      // set head target according to wasd...
      const head = balls[0];
      head.posTarget.add(this.nextMomentum);
      this.updateMomentumHandler(this.nextMomentum);

      // update head rotation
      // TODO make this animated? with a "rotate-once" component?
      if (this.nextOrientation !== this.headOrientation) {
        AFRAME.utils.entity.setComponentProperty(
          head.el,
          "rotation.y",
          this.nextOrientation
        );
        this.headOrientation = this.nextOrientation;
      }

      // move from beginning
      balls.forEach(ball => {
        ball.el.setAttribute("slither-once", {
          targetPos: ball.posTarget
        });
      });
    }
  }
});
