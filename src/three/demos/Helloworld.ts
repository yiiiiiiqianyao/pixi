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

export function initHelloWorldParticle(scene: Scene, camera: Camera, renderer: WebGLRenderer, control: OrbitControls, mesh: Mesh) {
    initPlane(scene);
    initLights(scene);
    const proton = new Proton();

    const emitter1 = createEmitter({
        p: {
            x: -100,
            y: 0
        },
        Body: createMesh("sphere")
    })

    const emitter2 = createEmitter({
        p: {
            x: 100,
            y: 0
        },
        Body: createMesh("cube")
    })

    proton.addEmitter(emitter1);
    proton.addEmitter(emitter2);

    proton.addRender(new MeshRender(scene));

    // Debug.drawZone(proton,scene,zone2);
    Debug.drawEmitter(proton, scene, emitter1);
    Debug.drawEmitter(proton, scene, emitter2);

    animate();
    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        proton.update();
        renderer.render(scene, camera);
        control.update();
        Debug.renderInfo(proton, 3);
    }
}

function createMesh(geoType: "sphere" | "cube") {
    if (geoType == "sphere") {
        const geometry = new SphereGeometry(10, 8, 8);
        const material = new MeshLambertMaterial({
            color: "#ff0000"
        });
        return new Mesh(geometry, material);
    } else {
        const geometry = new BoxGeometry(20, 20, 20);
        const material = new MeshLambertMaterial({
            color: "#00ffcc"
        });
        return new Mesh(geometry, material);
    }
}

function createEmitter(obj: any) {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(5, 10), new Span(.1, .25));
    emitter.addInitialize(new Mass(1));
    emitter.addInitialize(new Radius(10));
    emitter.addInitialize(new Life(2, 4));
    emitter.addInitialize(new Body(obj.Body));
    emitter.addInitialize(new Position(new BoxZone(100)));
    emitter.addInitialize(new Velocity(200, new Vector3D(0, 1, 1), 30));

    emitter.addBehaviour(new Rotate("random", "random"));
    emitter.addBehaviour(new Scale(1, 0.1));
    // Gravity
    emitter.addBehaviour(new Gravity(3));
    // @ts-ignore
    emitter.p.x = obj.p.x;
    // @ts-ignore
    emitter.p.y = obj.p.y;
    // @ts-ignore
    emitter.emit();
    return emitter;
}

function initPlane(scene: Scene) {
    var groundGeo = new PlaneGeometry(10000, 10000);
    var groundMat = new MeshPhongMaterial({
        color: 0xffffff,
        // specular: 0x050505
    });
    groundMat.color.setHSL(0.095, 1, 0.75);

    var ground = new Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -200;
    scene.add(ground);
}

function initLights(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 10000, 100000);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);
}