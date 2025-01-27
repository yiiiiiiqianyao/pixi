import { Initialize } from './Initialize'
import { Util } from '../utils/Util'

export const InitializeUtil = {
  initialize(emitter, particle, initializes) {
    var i = initializes.length;
    while (i--) {
      var initialize = initializes[i];
      if (initialize instanceof Initialize)
        initialize.init(emitter, particle);
      else InitializeUtil.init(emitter, particle, initialize);
    }

    InitializeUtil.bindEmitter(emitter, particle);
  },
  init(emitter, particle, initialize) {
    Util.setPrototypeByObj(particle, initialize);
    Util.setVectorByObj(particle, initialize);
  },
  bindEmitter(emitter, particle) {
    if (emitter.bindEmitter) {
      particle.p.add(emitter.p);
      particle.v.add(emitter.v);
      particle.a.add(emitter.a);
      particle.v.applyEuler(emitter.rotation);
    }
  },
};
