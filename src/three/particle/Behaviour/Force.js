import { Behaviour } from './Behaviour.js';
import { Vector3D } from '../math/Vector3D'
/**
 * The Behaviour class is the base for the other Behaviour
 *
 * @class Behaviour
 * @constructor
 */
export class Force extends Behaviour {
  constructor(fx, fy, fz, life, easing) {
    super(life, easing);
    this.reset.call(this, fx, fy, fz);
    this.name = "Force";
  }
  reset = function (fx, fy, fz) {
    this.force = this.normalizeForce(new Vector3D(fx, fy, fz));
    this.force.id = Math.random();
  };
  applyBehaviour(particle, time, index) {
    super.applyBehaviour.call(this, particle, time, index);
    particle.a.add(this.force);
  }
}