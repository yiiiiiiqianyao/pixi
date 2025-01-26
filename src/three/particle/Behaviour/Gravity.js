import { Force } from './Force';
export class Gravity extends Force {
    constructor(g, life, easing) {
      super(0, -g, 0, life, easing);
      this.name = "Gravity";
    }
    reset(g, life, easing) {
      super.reset.call(this, 0, -g, 0, life, easing);
    }
  }