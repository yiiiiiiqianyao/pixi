import * as THREE from 'three';
import { Zone } from './index.js';
    /**
     * MeshZone is a threejs mesh zone
     * @param {Geometry|Mesh} geometry - a THREE.Geometry or THREE.Mesh object
     * @example 
     * var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
     * var cylinder = new THREE.Mesh( geometry, material );
     * var meshZone = new MeshZone(geometry);
     * or
     * var meshZone = new MeshZone(cylinder);
     * @extends {Zone}
     * @constructor
     */
export class MeshZone extends Zone {
    constructor(geometry, scale) {
        super();
        // THREE.Geometry => THREE.BufferGeometry 在 Three.js 较新的版本中，Geometry 已被弃用，取而代之的是 BufferGeometry
        if (geometry instanceof THREE.BufferGeometry) {
            this.geometry = geometry;
        } else {
            this.geometry = geometry.geometry;
        }

        this.scale = scale || 1;
    }
    getPosition = function() {
        var vertices = this.geometry.vertices;
        var rVector = vertices[(vertices.length * Math.random()) >> 0];
        this.vector.x = rVector.x * this.scale;
        this.vector.y = rVector.y * this.scale;
        this.vector.z = rVector.z * this.scale;
        return this.vector;
    }

    crossing = function(particle) {
        if (this.log) {
            console.error('Sorry MeshZone does not support crossing method');
            this.log = false;
        }
    }
}