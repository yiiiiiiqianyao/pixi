import { Behaviour } from "./Behaviour.js";
import { Util } from "../util.js";

export class CrossZone extends Behaviour {
  constructor(a, b, life, easing) {
    super(life, easing);
    this.reset(a, b);
    ///dead /bound /cross
    this.name = "CrossZone";
  }
  reset(a, b, life, easing) {
    var zone, crossType;
    if (typeof a === "string") {
      crossType = a;
      zone = b;
    } else {
      crossType = b;
      zone = a;
    }

    this.zone = zone;
    this.zone.crossType = Util.initValue(crossType, "dead");
    if (life) super.reset.call(this, life, easing);
  }
  applyBehaviour(particle, time, index) {
    super.applyBehaviour.call(this, particle, time, index);
    this.zone.crossing.call(this.zone, particle);
  }
}