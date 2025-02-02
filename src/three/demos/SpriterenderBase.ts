import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Camera, Scene, WebGLRenderer } from "three";
import { Proton } from "../particle/core";
import { Emitter } from "../particle/emitter/Emitter";
import { Rate } from "../particle/initialize/Rate";
import { Span } from "../particle/math/Span";
import { Color } from "../particle/Behaviour/Color";
import { Debug } from "../particle/debug/debug";
import { Mass } from '../particle/initialize/Mass';
import { Radius } from '../particle/initialize/Radius';
import { Life } from '../particle/initialize/Life';
import { Body } from "../particle/initialize/Body";
import { SpriteRender } from '../particle/render/SpriteRender';
import { Position } from '../particle/initialize/Position';
import { createSprite } from './utils';
import { BoxZone } from '../particle/zone/BoxZone';
import { Velocity } from '../particle/initialize/Velocity';
import { Vector3D } from '../particle/math/Vector3D';
import { Rotate } from '../particle/Behaviour/Rotate';
import { Scale } from '../particle/Behaviour/Scale';
import { ease } from '../particle/ease/ease';
import { Alpha } from '../particle/Behaviour/Alpha';
export function initSpriteRenderBase(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    control.enabled = false;
    scene.background = new THREE.Color(0x000000);
    const proton = new Proton();
    proton.addEmitter(createEmitter());
    proton.addRender(new SpriteRender(scene));
    const zone2 = new BoxZone(400);
    Debug.drawZone(proton, scene, zone2);

    let tha = 0;
    animate();
    function animate() {
        requestAnimationFrame(animate);
        proton.update();
        renderer.render(scene, camera);
        camera.lookAt(scene.position);
        tha += .02;
        camera.position.x = Math.sin(tha) * 500;
        camera.position.z = Math.cos(tha) * 500;
    }
}

function createEmitter() {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(5, 10), new Span(.1, .25));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(100));
    emitter.addInitialize(new Life(2, 4));
    emitter.addInitialize(new Body(createSprite()));
    emitter.addInitialize(new Position(new BoxZone(100)));
    emitter.addInitialize(new Velocity(200, new Vector3D(0, 1, 1), 180));
    emitter.addBehaviour(new Rotate("random", "random"));
    emitter.addBehaviour(new Scale(1, 0.5));
    emitter.addBehaviour(new Alpha(1, 0, Infinity, ease.easeInQuart));
    emitter.addBehaviour(new Color(0xff0000, 'random', Infinity, ease.easeOutQuart));
    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();
    return emitter;
}