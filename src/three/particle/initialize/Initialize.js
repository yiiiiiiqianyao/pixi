export class Initialize {
    constructor() {
      this.name = "Initialize";
    }
    reset() {};
    init(emitter, particle) {
      if (particle) {
        this.initialize(particle);
      } else {
        this.initialize(emitter);
      }
    };
    initialize(target) {};
  }