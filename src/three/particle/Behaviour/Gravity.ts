import { Force } from './Force';
import { ease } from '../ease/ease';
export class Gravity extends Force {
    constructor(g: number, life?: number, easing?: typeof ease) {
      super(0, -g, 0, life, easing);
      this.name = "Gravity";
    }
    // @ts-ignore
    reset(g: number, life?: number, easing?: typeof ease) {
      // @ts-ignore
      super.reset.call(this, 0, -g, 0, life, easing);
    }
  }