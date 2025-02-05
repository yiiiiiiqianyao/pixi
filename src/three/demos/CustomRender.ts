// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AmbientLight, Camera, Mesh, PointLight, Scene, WebGLRenderer } from "three";
import { Proton } from "../particle/core";
import { CustomRender } from "../particle/render/CustomRender";
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
import { Vector3D } from '../particle/math/Vector3D';

export function initCustomRenderParticle(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls, mesh: Mesh) {
    initLights(scene);
    const proton = initProton(scene, mesh);
    // 渲染循环
    const animate = () => {
        control.update();
        proton.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}

function initProton(scene: Scene, mesh: Mesh) {
    const proton = new Proton();
    proton.addEmitter(createEmitter(scene, proton));

    //add custom renderer
    var renderer = new CustomRender();
    renderer.onParticleCreated = function(p) {
        //p.target = mesh.clone();
        p.target = this.targetPool.get(mesh);
        p.target.position.copy(p.p);
        scene.add(p.target);
    }

    renderer.onParticleUpdate = function(p) {
        p.target.position.copy(p.p);
        p.target.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);

        var scale = p.scale * 30;
        p.target.scale.set(scale, scale, scale);
    }

    renderer.onParticleDead = function(p) {
        this.targetPool.expire(p.target);
        scene.remove(p.target);
        p.target = null;
    }

    proton.addRender(renderer);
    return proton;
}

function createEmitter(scene: Scene, proton: Proton) {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(4, 8), new Span(.2, .5));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(100));
    emitter.addInitialize(new Life(2, 4));
    emitter.addInitialize(new Velocity(400, new Vector3D(0, 1, 0), 60));

    emitter.addBehaviour(new Rotate("random", "random"));
    emitter.addBehaviour(new Scale(1, .1));
    emitter.addBehaviour(new Gravity(6));

    var zone = new BoxZone(600);
    zone.friction = 0.95;
    zone.max = 7;
    emitter.addBehaviour(new CrossZone(zone, "bound"));
    emitter.addBehaviour(new Color(0xff0000, 'random', Infinity, ease.easeOutQuart));

    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();
    Debug.drawZone(proton, scene, zone);
    return emitter;
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}