import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Camera, Scene, WebGLRenderer } from "three";
import { Proton } from "../particle/core";
import { Emitter } from "../particle/emitter/Emitter";
import { Rate } from "../particle/initialize/Rate";
import { Span } from "../particle/math/Span";
import { Debug } from "../particle/debug/debug";
import { Mass } from '../particle/initialize/Mass';
import { Life } from '../particle/initialize/Life';
import { SpriteRender } from '../particle/render/SpriteRender';
import { Position } from '../particle/initialize/Position';
import { Vector3D } from '../particle/math/Vector3D';
import { Velocity } from '../particle/initialize/Velocity';
import { Radius } from '../particle/initialize/Radius';
import { BoxZone } from '../particle/zone/BoxZone';
import { Body } from '../particle/initialize/Body';
import { RandomDrift } from '../particle/Behaviour/RandomDrift';
import { Rotate } from '../particle/Behaviour/Rotate';
import { Gravity } from '../particle/Behaviour/Gravity';
import { ScreenZone } from '../particle/zone/ScreenZone';
import { CrossZone } from '../particle/Behaviour/CrossZone';
export function initSpriteRenderSnow(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    control.enabled = false;
    scene.background = new THREE.Color(0x000000);
    const proton = new Proton();
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(34, 48), new Span(.2, .5));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(new Span(10, 20)));

    const position = new Position();
    position.addZone(new BoxZone(2500, 10, 2500));
    emitter.addInitialize(position);

    emitter.addInitialize(new Life(5, 10));
    emitter.addInitialize(new Body(createSnow()));
    emitter.addInitialize(new Velocity(0, new Vector3D(0, -1, 0), 90));

    emitter.addBehaviour(new RandomDrift(10, 1, 10, .05));
    emitter.addBehaviour(new Rotate("random", "random"));
    emitter.addBehaviour(new Gravity(2));

    const screenZone = new ScreenZone(camera, renderer, 20, "234");
    emitter.addBehaviour(new CrossZone(screenZone, "dead"));

    emitter.p.x = 0;
    emitter.p.y = 800;
    emitter.emit();

    proton.addEmitter(emitter);
    proton.addRender(new SpriteRender(scene));

    animate();
    function animate() {
        requestAnimationFrame(animate);
        control.update();
        proton.update();
        renderer.render(scene, camera);
        Debug.renderInfo(proton, 3);
    }
}

function createSnow() {
    const map = new THREE.TextureLoader().load("./snow.png");
    const material = new THREE.SpriteMaterial({
        map: map,
        transparent: true,
        opacity: .5,
        color: 0xffffff
    });
    return new THREE.Sprite(material);
}