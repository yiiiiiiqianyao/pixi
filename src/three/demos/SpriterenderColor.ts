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
import { Scale } from '../particle/Behaviour/Scale';
import { ease } from '../particle/ease/ease';
import { Alpha } from '../particle/Behaviour/Alpha';
import { ScreenZone } from '../particle/zone/ScreenZone';
export function initSpriteRenderColor(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    control.enabled = false;
    scene.background = new THREE.Color(0x000000);
    const proton = new Proton();
    proton.addEmitter(createEmitter(camera, renderer));
    proton.addRender(new SpriteRender(scene));

    animate();
    function animate() {
        requestAnimationFrame(animate);
        proton.update();
        renderer.render(scene, camera);
        Debug.renderInfo(proton, 3);
    }
}

function createEmitter(camera: Camera, renderer: WebGLRenderer) {
    const colors = ['#529B88', '#CDD180', '#FFFA32', '#FB6255', '#FB4A53', '#FF4E50', '#F9D423'];
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(3, 6), new Span(.05, .2));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(200, 400));
    emitter.addInitialize(new Life(2, 4));
    emitter.addInitialize(new Body(createSprite()));
    emitter.addInitialize(new Position(new ScreenZone(camera, renderer)));
    emitter.addBehaviour(new Alpha(0, 1, Infinity, ease.easeOutCubic));
    emitter.addBehaviour(new Scale(2, 0, Infinity, ease.easeOutCubic));
    emitter.addBehaviour(new Color(colors, 'random'));
    emitter.emit();
    return emitter;
}