import { Util } from "../utils/Util";
import { EULER } from "../core/constant";
export class Integration {
  constructor(type) {
    this.type = Util.initValue(type, EULER);
  }
  integrate(particles, time, damping) {
    this.euler(particles, time, damping);
  }

  euler(particle, time, damping) {
    if (!particle.sleep) {
      particle.old.p.copy(particle.p);
      particle.old.v.copy(particle.v);
      particle.a.scalar(1 / particle.mass);
      particle.v.add(particle.a.scalar(time));
      particle.p.add(particle.old.v.scalar(time));
      damping && particle.v.scalar(damping);
      particle.a.clear();
    }
  }
}
