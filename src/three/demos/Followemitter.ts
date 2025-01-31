import * as THREE from 'three';
import { Camera, Scene, WebGLRenderer, AmbientLight, PointLight, TextureLoader, SpriteMaterial, AdditiveBlending, Sprite } from "three";
import { Proton } from "../particle/core";
import { Rate } from "../particle/initialize/Rate";
import { Span } from "../particle/math/Span";
import { Scale } from "../particle/Behaviour/Scale";
import { CrossZone } from "../particle/Behaviour/CrossZone";
import { Color } from "../particle/Behaviour/Color";
import { Debug } from "../particle/debug/debug";
import { Mass } from '../particle/initialize/Mass';
import { Radius } from '../particle/initialize/Radius';
import { Life } from '../particle/initialize/Life';
import { Velocity } from '../particle/initialize/Velocity';
import { Vector3D } from '../particle/math/Vector3D.js';
import { Body } from "../particle/initialize/Body";
import { FollowEmitter } from "../particle/emitter/FollowEmitter";
import { SpriteRender } from "../particle/render/SpriteRender";
import { Alpha } from "../particle/Behaviour/Alpha";
import { ScreenZone } from "../particle/zone/ScreenZone";
import { Force } from "../particle/Behaviour/Force";

// import { Proton, FollowEmitter, Debug, Rate, Span, Mass, Life, Body, Force, Radius, Velocity, Vector3D, Alpha, Color, Scale, CrossZone, ScreenZone, SpriteRender } from '../particle/index';
export function initFollowEmitter(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    scene.background = new THREE.Color(0x000000);
    // scene.add(mesh);
    initLights(scene);
    const proton = addProton(scene, camera, renderer)

    // 渲染循环
    const animate = () => {
        // @ts-ignore
        proton.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        Debug.renderInfo(proton, 3);
    };

    animate();
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}

function addProton(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    const proton = new Proton();
    const emitter = new FollowEmitter();
    emitter.rate = new Rate(new Span(5, 7), new Span(0.01, 0.02));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Life(2));
    emitter.addInitialize(new Body(createSprite()));
    emitter.addInitialize(new Radius(40));
    emitter.addInitialize(new Velocity(200, new Vector3D(0, 0, -1), 0));

    emitter.addBehaviour(new Alpha(1, 0));
    emitter.addBehaviour(new Color("#4F1500", "#0029FF"));
    emitter.addBehaviour(new Scale(1, 0.5));
    emitter.addBehaviour(new CrossZone(new ScreenZone(camera, renderer), "dead"));

    emitter.addBehaviour(new Force(0, 0, -20));
    emitter.setCameraAndRenderer(camera, renderer);

    emitter.emit();

    proton.addEmitter(emitter);
    proton.addRender(new SpriteRender(scene));
        
    return proton;
}


  function createSprite() {
    const map = new TextureLoader().load("/dot.png");
    const material = new SpriteMaterial({
      map: map,
      color: 0xff0000,
      blending: AdditiveBlending,
      fog: true
    });
    return new Sprite(material);
  }