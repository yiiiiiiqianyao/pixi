import { BaseRender } from "./BaseRender.js";
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