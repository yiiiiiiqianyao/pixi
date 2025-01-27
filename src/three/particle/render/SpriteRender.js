import * as THREE from "three";
import { BaseRender } from "./BaseRender.js";

export class SpriteRender extends BaseRender {
  constructor(container) {
    super();
    this._body = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    );
    this.name = "SpriteRender";
  }
  scale = function (particle) {
    particle.target.scale.set(
      particle.scale * particle.radius,
      particle.scale * particle.radius,
      1
    );
  };
}