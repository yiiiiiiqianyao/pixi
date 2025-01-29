// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from 'three';
import { Proton } from './particle/core';
import { initCustomRenderParticle } from "./demos/CustomRender";

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

        //  custom render particle demo
        initCustomRenderParticle(scene, camera, renderer, control, mesh);
        
    }


}