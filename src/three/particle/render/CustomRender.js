import { BaseRender } from "./BaseRender.js";
import { Pool } from "../pool.js";
export class CustomRender extends BaseRender {
  constructor() {
    super();
    this.targetPool = new Pool();
    this.materialPool = new Pool();

    this.name = "CustomRender";
  }
  onProtonUpdate = function () {};
  onParticleCreated = function (particle) {};
  onParticleUpdate = function (particle) {};
  onParticleDead = function (particle) {};
}