// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from 'three';
import { Proton } from './particle';
import { Span } from './particle/span.js';
import { CustomRender } from './particle/render.js';
import { Debug } from './particle/debug.js';
import { Vector3D } from './particle/Vector3D.js';
import { BoxZone } from './particle/BoxZone.js';
import { ease } from './particle/ease.js';
import { Gravity } from './particle/Behaviour/Gravity.js';
import { CrossZone } from './particle/Behaviour/CrossZone.js';
import { Scale } from './particle/Behaviour/Scale';
import { Rotate } from './particle/Behaviour/Rotate';
import { Color } from './particle/Behaviour/Color';

// https://github.com/drawcall/three.proton
export class SceneManager {
    renderer: THREE.WebGLRenderer;
    proton!: Proton
    constructor(wrap: HTMLDivElement) {
         // 创建场景
         const scene = new THREE.Scene();

         // 创建相机
         const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
         camera.position.z = 500;
         const control = new OrbitControls(camera, wrap);
         control.update();
 
         // 创建渲染器
         const renderer = new THREE.WebGLRenderer({
             antialias: true,
             alpha: true,
         });
         this.renderer = renderer;
         renderer.setSize(window.innerWidth, window.innerHeight);
         wrap.appendChild(renderer.domElement);
 
         // 创建几何体
         const geometry = new THREE.BoxGeometry();
         const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
         const mesh = new THREE.Mesh(geometry, material);
         scene.add(mesh);

         var ambientLight = new THREE.AmbientLight();
        scene.add(ambientLight);

        var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
        pointLight.position.set(0, 1000, 0);
        scene.add(pointLight);

         const proton = this.initProton(scene, mesh);
 
         // 渲染循环
         const animate = () => {
            control.update();
            proton.update();
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
         };
 
         animate();
    }

    initProton(scene: THREE.Scene, mesh: THREE.Mesh) {
        const proton = new Proton();
        proton.addEmitter(this.createEmitter(scene, proton));

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

    createEmitter(scene: THREE.Scene, proton: Proton) {
        const emitter = new Proton.Emitter();
        
        emitter.rate = new Proton.Rate(new Span(4, 8), new Span(.2, .5));
        // @ts-ignore
        emitter.addInitialize(new Proton.Mass(1));
        // @ts-ignore
        emitter.addInitialize(new Proton.Radius(100));
        // @ts-ignore
        emitter.addInitialize(new Proton.Life(2, 4));
        // @ts-ignore
        emitter.addInitialize(new Proton.Velocity(400, new Vector3D(0, 1, 0), 60));

        emitter.addBehaviour(new Rotate("random", "random"));
        emitter.addBehaviour(new Scale(1, .1));
        emitter.addBehaviour(new Gravity(6));

        var zone = new BoxZone(600);
        zone.friction = 0.95;
        zone.max = 7;
        emitter.addBehaviour(new CrossZone(zone, "bound"));
        emitter.addBehaviour(new Color(0xff0000, 'random', Infinity, ease.easeOutQuart));

        // @ts-ignore
        emitter.p.x = 0;
        // @ts-ignore
        emitter.p.y = 0;
        // @ts-ignore
        emitter.emit();
        Debug.drawZone(proton, scene, zone);

        return emitter;
    }
}