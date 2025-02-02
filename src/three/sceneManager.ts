// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from 'three';
import { Proton } from './particle/core';
import { initCustomRenderParticle } from "./demos/CustomRender";
import { initHelloWorldParticle } from "./demos/Helloworld";
import { initFollowEmitter } from "./demos/Followemitter";
import { initEightdiagramsParticle } from "./demos/Eightdiagrams";
import { initMeshRenderCollision } from "./demos/MeshrenderCollision";
import { initMeshRenderEmitter } from "./demos/MeshrenderEmitter";
import { initMeshZone } from "./demos/Meshzone";

// https://github.com/drawcall/three.proton
export class SceneManager {
    renderer: THREE.WebGLRenderer;
    proton!: Proton
    constructor(wrap: HTMLDivElement) {
         // 创建场景
         const scene = new THREE.Scene();
         scene.background = new THREE.Color(0xaaccff);
         scene.fog = new THREE.Fog(0xffffff, 1, 10000);

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

        //  custom render particle demo
        // initCustomRenderParticle(scene, camera, renderer, control, mesh);
        // initHelloWorldParticle(scene, camera, renderer, control, mesh);
        // initFollowEmitter(scene, camera, renderer);
        // initEightdiagramsParticle(scene, camera, renderer);
        // initMeshRenderCollision(scene, camera, renderer, control);
        // initMeshRenderEmitter(scene, camera, renderer, control);
        initMeshZone(scene, camera, renderer, control);
    }
}