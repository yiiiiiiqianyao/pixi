import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AmbientLight, Camera, PointLight, Scene, WebGLRenderer } from "three";
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
import { MeshZone } from '../particle/zone/MeshZone';
import { RandomDrift } from '../particle/Behaviour/RandomDrift';
import { Gravity } from '../particle/Behaviour/Gravity';
import { createSprite } from './utils';

let randomBehaviour: RandomDrift;
let gravity: Gravity;
export function initMeshZone(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls) {
    control.enabled = false;
    initLights(scene);
    scene.background = new THREE.Color(0x000000);
    let tha = 0;
    const geometry = new THREE.SphereGeometry(1, 24, 24);
    const sphereMaterial = new THREE.MeshLambertMaterial();
    const sphereMesh = new THREE.Mesh(geometry, sphereMaterial);
    const proton = new Proton();
    proton.addEmitter(createEmitter(sphereMesh));
    proton.addRender(new SpriteRender(scene));
    addMouseEvent();
    animate();
    function animate() {
        requestAnimationFrame(animate);
        proton.update();
        renderer.render(scene, camera);

        tha += 0.005;
        camera.lookAt(scene.position);
        camera.position.x = Math.sin(tha) * 500;
        camera.position.z = Math.cos(tha) * 500;
        Debug.renderInfo(proton, 3);
    }

}


function createEmitter(mesh: THREE.Object3D) {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(11, 15), new Span(0.02));
    //addInitialize
    emitter.addInitialize(new Position(new MeshZone(mesh, 200)));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(26, 50));
    emitter.addInitialize(new Life(1.5));
    emitter.addInitialize(new Body(createSprite()));

    //addBehaviour
    randomBehaviour = new RandomDrift(2, 2, 2);
    gravity = new Gravity(0);
    // @ts-ignore
    emitter.addBehaviour(customScaleBehaviour());
    emitter.addBehaviour(gravity);
    emitter.addBehaviour(randomBehaviour);
    emitter.addBehaviour(new Color(["#00aeff", "#0fa954", "#54396e", "#e61d5f"]));
    emitter.addBehaviour(new Color("random"));

    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();

    return emitter;
}

function customScaleBehaviour() {
    return {
        initialize: function (particle: any) {
            particle.oldRadius = particle.radius;
            particle.scale = 0;
        },
        applyBehaviour: function (particle: any) {
            if (particle.energy >= 2 / 3) {
                particle.scale = (1 - particle.energy) * 3;
            } else if (particle.energy <= 1 / 3) {
                particle.scale = particle.energy * 3;
            }
            particle.radius = particle.oldRadius * particle.scale;
        }
    };
}

function addMouseEvent() {
    var index = 0;
    window.addEventListener("mousedown", function (e) {
        index++;
        if (index % 3 == 1) {
            randomBehaviour.reset(2, 0, 0.2);
            gravity.reset(3.5);
        } else if (index % 3 == 2) {
            randomBehaviour.reset(10, 10, 10);
            gravity.reset(0);
        } else {
            randomBehaviour.reset(2, 2, 2);
            gravity.reset(0);
        }
    });
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}