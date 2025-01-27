import * as THREE from "three";
import { Proton } from "./index.js";
import { PUID } from "./utils/PUID.js";
import { Pool } from './pool.js';
export class BaseRender {
  constructor() {
    this.name = "BaseRender";
  }
  init(proton) {
    var self = this;
    this.proton = proton;

    this.proton.addEventListener("PROTON_UPDATE", function (proton) {
      self.onProtonUpdate.call(self, proton);
    });

    this.proton.addEventListener("PARTICLE_CREATED", function (particle) {
      self.onParticleCreated.call(self, particle);
    });

    this.proton.addEventListener("PARTICLE_UPDATE", function (particle) {
      self.onParticleUpdate.call(self, particle);
    });

    this.proton.addEventListener("PARTICLE_DEAD", function (particle) {
      self.onParticleDead.call(self, particle);
    });
  }

  remove(proton) {
    // this.proton.removeEventListener("PROTON_UPDATE", this.onProtonUpdate);
    // this.proton.removeEventListener("PARTICLE_CREATED", this.onParticleCreated);
    // this.proton.removeEventListener("PARTICLE_UPDATE", this.onParticleUpdate);
    // this.proton.removeEventListener("PARTICLE_DEAD", this.onParticleDead);
    this.proton = null;
  }
  onParticleCreated(particle) {}
  onParticleUpdate(particle) {}
  onParticleDead(particle) {}
  onProtonUpdate(proton) {}
}

export class MeshRender extends BaseRender {
  constructor(container) {
    super();
    this.container = container;

    this._targetPool = new Pool();
    this._materialPool = new Pool();
    this._body = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 50),
      new THREE.MeshLambertMaterial({ color: "#ff0000" })
    );
    this.name = "MeshRender";
  }
  onProtonUpdate() {}
  onParticleCreated = function (particle) {
    if (!particle.target) {
      //set target
      if (!particle.body) particle.body = this._body;
      particle.target = this._targetPool.get(particle.body);

      //set material
      if (particle.useAlpha || particle.useColor) {
        particle.target.material.__puid = PUID.id(particle.body.material);
        particle.target.material = this._materialPool.get(
          particle.target.material
        );
      }
    }

    if (particle.target) {
      particle.target.position.copy(particle.p);
      this.container.add(particle.target);
    }
  };

  onParticleUpdate = function (particle) {
    if (particle.target) {
      particle.target.position.copy(particle.p);
      particle.target.rotation.set(
        particle.rotation.x,
        particle.rotation.y,
        particle.rotation.z
      );
      this.scale(particle);

      if (particle.useAlpha) {
        particle.target.material.opacity = particle.alpha;
        particle.target.material.transparent = true;
      }

      if (particle.useColor) {
        particle.target.material.color.copy(particle.color);
      }
    }
  };

  scale = function (particle) {
    particle.target.scale.set(particle.scale, particle.scale, particle.scale);
  };

  onParticleDead = function (particle) {
    if (particle.target) {
      if (particle.useAlpha || particle.useColor)
        this._materialPool.expire(particle.target.material);

      this._targetPool.expire(particle.target);
      this.container.remove(particle.target);
      particle.target = null;
    }
  };
}

export class SpriteRender extends BaseRender {
  constructor(container) {
    super();
    this._body = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    );
    this.name = "SpriteRender";
  }
  scale = function (particle) {
    particle.target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  };
}

export class CustomRender extends BaseRender {
  constructor() {
    super();
    this.targetPool = new Pool();
    this.materialPool = new Pool();

    this.name = "CustomRender";
  }
  onProtonUpdate = function () {};
  onParticleCreated = function (particle) {};
  onParticleUpdate = function (particle) {};
  onParticleDead = function (particle) {};
}
export class PointsRender extends BaseRender {
  constructor(ps) {
    super();
    this.points = ps;
    this.name = "PointsRender";
  }
  onProtonUpdate = function () {};

  onParticleCreated = function (particle) {
    if (!particle.target) {
      particle.target = new THREE.Vector3();
    }

    particle.target.copy(particle.p);
    this.points.geometry.vertices.push(particle.target);
  };

  onParticleUpdate = function (particle) {
    if (particle.target) {
      particle.target.copy(particle.p);
    }
  };

  onParticleDead = function (particle) {
    if (particle.target) {
      var index = this.points.geometry.vertices.indexOf(particle.target);
      if (index > -1) this.points.geometry.vertices.splice(index, 1);

      particle.target = null;
    }
  };
}
