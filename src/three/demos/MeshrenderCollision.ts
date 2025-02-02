import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BoxGeometry, Camera, Mesh, MeshLambertMaterial, PlaneGeometry, MeshPhongMaterial, Scene, SphereGeometry, WebGLRenderer, AmbientLight, PointLight, SpotLight, Vector3 } from "three";
import { Proton } from "../particle/core";
import { Emitter } from "../particle/emitter/Emitter";
import { Rate } from "../particle/initialize/Rate";
import { Span } from "../particle/math/Span";
import { Rotate } from "../particle/Behaviour/Rotate";
import { Scale } from "../particle/Behaviour/Scale";
import { BoxZone } from "../particle/zone/BoxZone";
import { Gravity } from "../particle/Behaviour/Gravity";
import { CrossZone } from "../particle/Behaviour/CrossZone";
import { Color } from "../particle/Behaviour/Color";
import { ease } from "../particle/ease/ease";
import { Debug } from "../particle/debug/debug";
import { Mass } from '../particle/initialize/Mass';
import { Radius } from '../particle/initialize/Radius';
import { Life } from '../particle/initialize/Life';
import { Velocity } from '../particle/initialize/Velocity';
import { Vector3D } from '../particle/math/Vector3D.js';
import { MeshRender } from "../particle/render/MeshRender";
import { Position } from "../particle/initialize/Position";
import { Body } from "../particle/initialize/Body";
import { Collision } from '../particle/Behaviour/Collision';
export function initMeshRenderCollision(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    initLights(scene);
    const geometry = new THREE.SphereGeometry(100.0, 24, 24);
    const sphereMaterial = new THREE.MeshLambertMaterial();
    const sphereMesh = new THREE.Mesh(geometry, sphereMaterial);
    const proton = createProton(scene, sphereMesh);
    animate();
    function animate() {
        requestAnimationFrame(animate);
        // camera.lookAt(scene.position);
        renderer.render(scene, camera);
        proton.update();
        control.update();
    }
}

function createProton(scene: Scene, sphereMesh: Mesh) {
    const proton = new Proton;
    var emitter = new Emitter();
    emitter.rate = new Rate(new Span(2, 5), new Span(.5, 1));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(100));
    emitter.addInitialize(new Life(5, 6));
    emitter.addInitialize(new Body(sphereMesh));
    emitter.addInitialize(new Velocity(new Span(300, 500), new Vector3D(0, 1, 0), 30));
    //emitter.addBehaviour(new Proton.Alpha(1, 0));
    emitter.addBehaviour(new Scale(1));
    emitter.addBehaviour(new Gravity(4));
    emitter.addBehaviour(new Collision(emitter));
    emitter.emit();
    proton.addEmitter(emitter);
    proton.addRender(new MeshRender(scene));
    return proton;
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}