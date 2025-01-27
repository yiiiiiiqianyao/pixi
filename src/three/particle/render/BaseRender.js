export class BaseRender {
  constructor() {
    this.name = "BaseRender";
  }
  init(proton) {
    var self = this;
    this.proton = proton;

    this.proton.addEventListener("PROTON_UPDATE", function (proton) {
      self.onProtonUpdate.call(self, proton);
    });

    this.proton.addEventListener("PARTICLE_CREATED", function (particle) {
      self.onParticleCreated.call(self, particle);
    });

    this.proton.addEventListener("PARTICLE_UPDATE", function (particle) {
      self.onParticleUpdate.call(self, particle);
    });

    this.proton.addEventListener("PARTICLE_DEAD", function (particle) {
      self.onParticleDead.call(self, particle);
    });
  }

  remove(proton) {
    // this.proton.removeEventListener("PROTON_UPDATE", this.onProtonUpdate);
    // this.proton.removeEventListener("PARTICLE_CREATED", this.onParticleCreated);
    // this.proton.removeEventListener("PARTICLE_UPDATE", this.onParticleUpdate);
    // this.proton.removeEventListener("PARTICLE_DEAD", this.onParticleDead);
    this.proton = null;
  }
  onParticleCreated(particle) {}
  onParticleUpdate(particle) {}
  onParticleDead(particle) {}
  onProtonUpdate(proton) {}
}