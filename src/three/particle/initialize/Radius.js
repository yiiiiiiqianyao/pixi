import { Initialize } from './Initialize.js';
import { createSpan } from '../math/Span';
/**
 * Radius is init particle's Radius
 * @param {Number} a - the Radius's start point
 * @param {Number} b - the Radius's end point
 * @param {String} c - span's center
 * @example
 * var Radius = new Proton.Radius(3,5);
 * or
 * var Radius = new Proton.Radius(3,1,"center");
 * @extends {Initialize}
 * @constructor
 */
export class Radius extends Initialize {
  constructor(a, b, c){
    super();
    this.radius = createSpan(a, b, c);
  }
  reset  (a, b, c) {
    this.radius = createSpan(a, b, c);
  };
  initialize = function (particle) {
    particle.radius = this.radius.getValue();
    particle.transform.oldRadius = particle.radius;
  };
}
