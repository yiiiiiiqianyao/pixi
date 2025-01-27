export class Initialize {
    constructor() {
      this.name = "Initialize";
    }
    reset = function () {};
    init = function (emitter, particle) {
      if (particle) {
        this.initialize(particle);
      } else {
        this.initialize(emitter);
      }
    };
    initialize = function (target) {};
  }