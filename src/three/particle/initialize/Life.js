import { Initialize } from './Initialize.js';
import { createSpan } from '../span.js';
/**
 * Life is init particle's Life
 * @param {Number} a - the Life's start point
 * @param {Number} b - the Life's end point
 * @param {String} c - span's center
 * @example
 * var life = new Life(3,5);
 * or
 * var life = new Life(Infinity);
 * @extends {Initialize}
 * @constructor
 */
export class Life extends Initialize {
  constructor(a, b, c) {
    super();
    this.lifePan = createSpan(a, b, c);
  }
  initialize = function (target) {
    if (this.lifePan.a === Infinity || this.lifePan.a === "infi")
      target.life = Infinity;
    else target.life = this.lifePan.getValue();
  };
}