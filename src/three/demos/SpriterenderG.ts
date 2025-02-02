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
import { Life } from '../particle/initialize/Life';
import { Body } from "../particle/initialize/Body";
import { SpriteRender } from '../particle/render/SpriteRender';
import { Position } from '../particle/initialize/Position';
import { createSprite } from './utils';
import { Scale } from '../particle/Behaviour/Scale';
import { ease } from '../particle/ease/ease';
import { Gravity } from '../particle/Behaviour/Gravity';
import { Vector3D } from '../particle/math/Vector3D';
import { SphereZone } from '../particle/zone/SphereZone';
import { Velocity } from '../particle/initialize/Velocity';
import { RandomDrift } from '../particle/Behaviour/RandomDrift';
export function initSpriteRenderG(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    scene.background = new THREE.Color(0x000000);
    const proton = new Proton();
    proton.addEmitter(createEmitter());
    proton.addRender(new SpriteRender(scene));
    const clock = new THREE.Clock();
    animate();
    function animate() {
        requestAnimationFrame(animate);
        proton.update(clock.getDelta());
        renderer.render(scene, camera);
        control.update();
        Debug.renderInfo(proton, 3);
    }
}

function createEmitter() {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(10, 15), new Span(.05, .1));
    emitter.addInitialize(new Body(createSprite()));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Life(1, 3));
    emitter.addInitialize(new Position(new SphereZone(20)));
    emitter.addInitialize(new Velocity(new Span(500, 800), new Vector3D(0, 1, 0), 30));
    emitter.addBehaviour(new RandomDrift(10, 10, 10, .05));
    emitter.addBehaviour(new Scale(new Span(2, 3.5), 0));
    emitter.addBehaviour(new Gravity(6));
    emitter.addBehaviour(new Color('#FF0026', ['#ffff00', '#ffff11'], Infinity, ease.easeOutSine));
    emitter.p.x = 0;
    emitter.p.y = -150;
    emitter.emit();
    return emitter;
}
