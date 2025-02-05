import * as THREE from 'three';
import { Camera, Scene, WebGLRenderer } from "three";
import { Proton } from "../particle/core";
import { Emitter } from "../particle/emitter/Emitter";
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
import { Vector3D } from '../particle/math/Vector3D';
import { Body } from "../particle/initialize/Body";
import { SpriteRender } from "../particle/render/SpriteRender";
import { Alpha } from "../particle/Behaviour/Alpha";
import { Force } from "../particle/Behaviour/Force";
import { ScreenZone } from "../particle/zone/ScreenZone";
import { createSprite } from './utils';

const R = 70;
export function initEightdiagramsParticle(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    scene.background = new THREE.Color(0x000000);
    const { proton, emitter1, emitter2 } = addProton(scene, camera, renderer);
    var tha = 0;
    var ctha = 0;
    animate();
    function animate() {
        requestAnimationFrame(animate);
        animateEmitter();
        render();
    }

    function render() {
        proton.update();
        renderer.render(scene, camera);
        //controls.update();

        camera.lookAt(scene.position);
        ctha += .02;
        camera.position.x = Math.sin(ctha) * 500;
        camera.position.z = Math.cos(ctha) * 500;
        camera.position.y = Math.sin(ctha) * 500;

        Debug.renderInfo(proton, 3);
    }

    function animateEmitter() {
        tha += .13;
        emitter1.p.x = R * Math.cos(tha);
        emitter1.p.y = R * Math.sin(tha);
        emitter2.p.x = R * Math.cos(tha + Math.PI / 2);
        emitter2.p.y = R * Math.sin(tha + Math.PI / 2);
    }
}

function addProton(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    const proton = new Proton();
    const emitter1 = createEmitter(R, 0, '#4F1500', '#0029FF', camera, renderer);
    const emitter2 = createEmitter(-R, 0, '#004CFE', '#6600FF', camera, renderer);
    proton.addEmitter(emitter1);
    proton.addEmitter(emitter2);
    proton.addRender(new SpriteRender(scene));
    return {
        proton,
        emitter1,
        emitter2
    };
}

function createEmitter(x: number, y: number, color1: string, color2: string, camera: Camera, renderer: WebGLRenderer) {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(5, 7), new Span(.01, .02));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Life(2));
    emitter.addInitialize(new Body(createSprite()));
    emitter.addInitialize(new Radius(80));
    emitter.addInitialize(new Velocity(200, new Vector3D(0, 0, -1), 0));

    emitter.addBehaviour(new Alpha(1, 0));
    emitter.addBehaviour(new Color(color1, color2));
    emitter.addBehaviour(new Scale(1, 0.5));
    emitter.addBehaviour(new CrossZone(new ScreenZone(camera, renderer), 'dead'));
    emitter.addBehaviour(new Force(0, 0, -20));
    // emitter.addBehaviour(new Proton.Attraction({
    //     x: 0,
    //     y: 0,
    //     z: 0
    // }, 5, 250));
    emitter.p.x = x;
    emitter.p.y = y;
    emitter.emit();
    return emitter;
}

