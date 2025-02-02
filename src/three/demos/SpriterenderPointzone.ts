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
import { SpriteRender } from '../particle/render/SpriteRender';
import { Position } from '../particle/initialize/Position';
import { Scale } from '../particle/Behaviour/Scale';
import { Vector3D } from '../particle/math/Vector3D';
import { Velocity } from '../particle/initialize/Velocity';
import { PointZone } from '../particle/zone/PointZone';
import { Radius } from '../particle/initialize/Radius';
import { Alpha } from '../particle/Behaviour/Alpha';

let tha = 0;
let hcolor = 0;
export function initSpriteRenderPointZone(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    control.enabled = false;
    scene.background = new THREE.Color(0x000000);
    const proton = new Proton();
    const clock = new THREE.Clock();
    const emitter = new Emitter();
    //setRate
    emitter.rate = new Rate(new Span(4, 16), new Span(.01));
    //addInitialize
    emitter.addInitialize(new Position(new PointZone(0, 0, 0)));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(6, 12));
    emitter.addInitialize(new Life(3));
    emitter.addInitialize(new Velocity(45, new Vector3D(0, 1, 0), 180));
    //addBehaviour
    emitter.addBehaviour(new Alpha(1, 0));
    emitter.addBehaviour(new Scale(.1, 1.3));

    const color1 = new THREE.Color();
    const color2 = new THREE.Color();
    const colorBehaviour = new Color(color1, color2);
    emitter.addBehaviour(colorBehaviour);

    emitter.emit();
    //add emitter
    proton.addEmitter(emitter);
    proton.addRender(new SpriteRender(scene));

    animate();
    function animate() {
        requestAnimationFrame(animate);
        changeParticleColor(color1, color2);
        protonUpdate(clock, proton);
        renderer.render(scene, camera);
        camera.lookAt(scene.position);
        moveEmitter(emitter);
        rotateCamera(camera);
        Debug.renderInfo(proton, 3);
    }
}

function protonUpdate(clock: THREE.Clock, proton: Proton) {
    var delta = clock.getDelta();
    delta < 5 / 60 && proton.update(delta);
}

function changeParticleColor(color1: THREE.Color, color2: THREE.Color) {
    hcolor += .01;
    color1.setHSL(hcolor - (hcolor >> 0), 1, .5);
    color2.setHSL(hcolor - (hcolor >> 0) + .3, 1, .5);
}

function moveEmitter(emitter: Emitter){
    tha += Math.PI / 150;
    var p = 300 * Math.sin(2 * tha);
    emitter.p.x = p * Math.cos(tha);
    emitter.p.y = p * Math.sin(tha);
    emitter.p.z = p * Math.tan(tha) / 2;
}

var ctha = 0;
var r = 500;
function rotateCamera(camera: Camera){
    ctha += .016;
    r = 300;
    camera.position.x = Math.sin(ctha) * r;
    camera.position.z = Math.cos(ctha) * r;
    camera.position.y = Math.sin(ctha) * r;
}