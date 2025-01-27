import { Initialize } from './Initialize.js';
import { createSpan } from '../math/Span.js';
/**
 * Mass is init particle's Mass
 * @param {Number} a - the Mass's start point
 * @param {Number} b - the Mass's end point
 * @param {String} c - span's center
 * @example
 * var Mass = new Proton.Mass(3,5);
 * or
 * var Mass = new Proton.Mass(Infinity);
 * @extends {Initialize}
 * @constructor
 */
export class Mass extends Initialize {
  constructor(a, b, c) {
    super();
    this.massPan = createSpan(a, b, c);
  }
  initialize = function (target) {
    target.mass = this.massPan.getValue();
  };
}

