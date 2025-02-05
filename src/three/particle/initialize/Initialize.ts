import { Particle } from "../core/Particle";
import { Emitter } from "../emitter/Emitter";

export class Initialize {
  name: string;
  constructor() {
    this.name = "Initialize";
  }
  reset() { };
  init(emitter: Emitter, particle: Particle) {
    if (particle) {
      this.initialize(particle);
    } else {
      this.initialize(emitter);
    }
  };
  initialize(target: any) { };
}