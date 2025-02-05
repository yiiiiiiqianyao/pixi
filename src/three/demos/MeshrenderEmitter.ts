import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AmbientLight, Camera, PointLight, Scene, WebGLRenderer } from "three";
import { Proton } from "../particle/core";
import { Emitter } from "../particle/emitter/Emitter";
import { Rate } from "../particle/initialize/Rate";
import { Span } from "../particle/math/Span";
import { Rotate } from "../particle/Behaviour/Rotate";
import { Scale } from "../particle/Behaviour/Scale";
import { Color } from "../particle/Behaviour/Color";
import { ease } from "../particle/ease/ease";
import { Debug } from "../particle/debug/debug";
import { Mass } from '../particle/initialize/Mass';
import { Radius } from '../particle/initialize/Radius';
import { Life } from '../particle/initialize/Life';
import { Velocity } from '../particle/initialize/Velocity';
import { Vector3D } from '../particle/math/Vector3D';
import { MeshRender } from "../particle/render/MeshRender";
import { Body } from "../particle/initialize/Body";
import { Spring } from '../particle/Behaviour/Spring';
import { BoxZone } from '../particle/zone/BoxZone';
let tha = 0,R = 200;
export function initMeshRenderEmitter(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    initLights(scene);
    const clock = new THREE.Clock();
    const proton = new Proton();
    const { emitter, spring } = createEmitter(scene, proton)
    proton.addEmitter(emitter);
    proton.addRender(new MeshRender(scene));

    animate();
    function animate() {
        // stats.begin();
        requestAnimationFrame(animate);
        proton.update(clock.getDelta());
        renderer.render(scene, camera);

        tha += .005;
        proton.emitters[0].p.x = Math.cos(tha) * R;
        proton.emitters[0].p.y = Math.sin(tha) * R;
        proton.emitters[0].rotation.x += 0.01;
        var x = Math.cos(tha) * 100;
        var y = Math.sin(tha) * 100;
        spring.reset(x, y, 100);
        control.update();

        Debug.renderInfo(proton, 3);
        // stats.end();
    }
}

function createEmitter(scene: Scene, proton: Proton) {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(6, 12), new Span(.2, .5));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(100));
    emitter.addInitialize(new Life(2, 4));
    emitter.addInitialize(new Body(createBox()));
    emitter.addInitialize(new Velocity(300, new Vector3D(0, 1, 0), 50));
    emitter.addBehaviour(new Rotate("random", "random"));
    emitter.addBehaviour(new Scale(1, .1));
    
    var zone2 = new BoxZone(500);
    const spring = new Spring(100, 100, 100);
    emitter.addBehaviour(spring);
    emitter.addBehaviour(new Color('random', 'random', Infinity, ease.easeOutQuart));

    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();

    Debug.drawZone(proton,scene,zone2);
    Debug.drawEmitter(proton, scene, emitter);
    return { emitter, spring };
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}

function createBox() {
    var geometry = new THREE.BoxGeometry(20, 20, 20);
    var material = new THREE.MeshLambertMaterial({
        color: "#00ffcc"
    });

    return new THREE.Mesh(geometry, material);
}