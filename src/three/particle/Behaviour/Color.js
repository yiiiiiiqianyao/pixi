import { Behaviour } from './Behaviour.js';
import { createArraySpan } from '../math/Span';
import { MathUtils } from '../math/MathUtils.js';
import { ColorUtil } from "../utils/ColorUtil.js";
/**
 * The Scale class is the base for the other Behaviour
 *
 * @class Behaviour
 * @constructor
 */
export class Color extends Behaviour {
  constructor(a, b, life, easing) {
    super(life, easing);
    this.reset(a, b);
    this.name = "Color";
  }
  reset(a, b, life, easing) {
    if (b === null || b === undefined) this._same = true;
    else this._same = false;

    this.a = createArraySpan(a);
    this.b = createArraySpan(b);
    life && super.reset.call(this, life, easing);
  }
  initialize(particle) {
    particle.transform.colorA = ColorUtil.getRGB(this.a.getValue());

    particle.useColor = true;
    if (this._same) particle.transform.colorB = particle.transform.colorA;
    else particle.transform.colorB = ColorUtil.getRGB(this.b.getValue());
  }
  applyBehaviour(particle, time, index) {
    super.applyBehaviour.call(this, particle, time, index);

    if (!this._same) {
      particle.color.r = MathUtils.lerp(
        particle.transform.colorA.r,
        particle.transform.colorB.r,
        this.energy
      );
      particle.color.g = MathUtils.lerp(
        particle.transform.colorA.g,
        particle.transform.colorB.g,
        this.energy
      );
      particle.color.b = MathUtils.lerp(
        particle.transform.colorA.b,
        particle.transform.colorB.b,
        this.energy
      );
    } else {
      particle.color.r = particle.transform.colorA.r;
      particle.color.g = particle.transform.colorA.g;
      particle.color.b = particle.transform.colorA.b;
    }
  }
}