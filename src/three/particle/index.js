// @ts-nocheck
import * as THREE from 'three';
import { Util } from './util.js';
import { Span } from './span.js';
import { MathUtils } from './mathUtils.js';
import { PUID } from './puid.js';
import { ColorUtil } from './colorUtil.js';
import { THREEUtil } from './THREEUtil.js';
import { Pool } from './pool.js'

/**
 * @name Proton is a particle engine for three.js
 *
 * @class Proton
 * @param {number} preParticles input any number
 * @param {number} integrationType input any number
 * @example var proton = new Proton(200);
 */
export class Proton {
    constructor(preParticles, integrationType) {
        this.preParticles = Util.initValue(preParticles, Proton.POOL_MAX);
        this.integrationType = Util.initValue(integrationType, Proton.EULER);

        this.emitters = [];
        this.renderers = [];

        this.pool = new Pool();
        Proton.integrator = new Proton.Integration(this.integrationType);
    }

     /**
         * @name add a type of Renderer
         *
         * @method addRender
         * @param {Renderer} render
         */
     addRender(renderer) {
        this.renderers.push(renderer);
        renderer.init(this);
    }

    /**
     * @name add a type of Renderer
     *
     * @method addRender
     * @param {Renderer} render
     */
    removeRender(renderer) {
        this.renderers.splice(this.renderers.indexOf(renderer), 1);
        renderer.remove(this);
    }

    /**
     * add the Emitter
     *
     * @method addEmitter
     * @param {Emitter} emitter
     */
    addEmitter(emitter) {
        this.emitters.push(emitter);
        emitter.parent = this;
        this.dispatchEvent("EMITTER_ADDED", emitter);
    }

    removeEmitter(emitter) {
        if (emitter.parent !== this) return;

        this.emitters.splice(this.emitters.indexOf(emitter), 1);
        emitter.parent = null;
        this.dispatchEvent("EMITTER_REMOVED", emitter);
    }

    update($delta) {
        this.dispatchEvent("PROTON_UPDATE", this);

        var delta = $delta || 0.0167;
        if (delta > 0) {
            var i = this.emitters.length;
            while (i--) this.emitters[i].update(delta);
        }

        this.dispatchEvent("PROTON_UPDATE_AFTER", this);
    }

    /**
     * getCount
     * @name get the count of particle
     * @return (number) particles count
     */
    getCount() {
        var total = 0;
        var i, length = this.emitters.length;
        for (i = 0; i < length; i++) total += this.emitters[i].particles.length;
        return total;
    }

    /**
     * destroy
     * @name destroy the proton
     */
    destroy() {
        var i = 0,
            length = this.emitters.length;

        for (i; i < length; i++) {
            this.emitters[i].destroy();
            delete this.emitters[i];
        }

        this.emitters.length = 0;
        this.pool.destroy();
    }
}

//the max particle number in pool
Proton.POOL_MAX = 500;
Proton.TIME_STEP = 60;
Proton.PI = 3.142;
Proton.DR = Proton.PI / 180;

//1:100
Proton.MEASURE = 100;
Proton.EULER = 'euler';
Proton.RK2 = 'runge-kutta2';
Proton.RK4 = 'runge-kutta4';
Proton.VERLET = 'verlet';

Proton.PARTICLE_CREATED = 'partilcleCreated';
Proton.PARTICLE_UPDATE = 'partilcleUpdate';
Proton.PARTICLE_SLEEP = 'particleSleep';
Proton.PARTICLE_DEAD = 'partilcleDead';
Proton.PROTON_UPDATE = 'protonUpdate';
Proton.PROTON_UPDATE_AFTER = 'protonUpdateAfter';
Proton.EMITTER_ADDED = 'emitterAdded';
Proton.EMITTER_REMOVED = 'emitterRemoved';

Proton.bindEmtterEvent = false;


// EventDispatcher
function EventDispatcher() {
    this.initialize();
};

EventDispatcher.initialize = function(target) {
    target.addEventListener = p.addEventListener;
    target.removeEventListener = p.removeEventListener;
    target.removeAllEventListeners = p.removeAllEventListeners;
    target.hasEventListener = p.hasEventListener;
    target.dispatchEvent = p.dispatchEvent;
};

var p = EventDispatcher.prototype;

p._listeners = null;

p.initialize = function() {};
p.addEventListener = function(type, listener) {
    if (!this._listeners) {
        this._listeners = {};
    } else {
        this.removeEventListener(type, listener);
    }

    if (!this._listeners[type]) this._listeners[type] = []
    this._listeners[type].push(listener);

    return listener;
};

p.removeEventListener = function(type, listener) {
    if (!this._listeners) return;
    if (!this._listeners[type]) return;

    var arr = this._listeners[type];
    for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === listener) {
            if (l === 1) {
                delete(this._listeners[type]);
            }
            // allows for faster checks.
            else {
                arr.splice(i, 1);
            }
            break;
        }
    }
};

p.removeAllEventListeners = function(type) {
    if (!type)
        this._listeners = null;
    else if (this._listeners)
        delete(this._listeners[type]);
};

p.dispatchEvent = function(eventName, eventTarget) {
    var ret = false,
        listeners = this._listeners;

    if (eventName && listeners) {
        var arr = listeners[eventName];
        if (!arr) return ret;

        arr = arr.slice();
        // to avoid issues with items being removed or added during the dispatch

        var handler, i = arr.length;
        while (i--) {
            var handler = arr[i];
            ret = ret || handler(eventTarget);
        }
        
    }

    return !!ret;
};

p.hasEventListener = function(type) {
    var listeners = this._listeners;
    return !!(listeners && listeners[type]);
};

EventDispatcher.initialize(Proton.prototype);
Proton.EventDispatcher = EventDispatcher;

    Particle.ID = 0;

    /**
     * the Particle class
     * @param {Number} pObj - the parameters of particle config;
     * @example 
     * var p = new Proton.Particle({life:3,dead:false});
     * or
     * var p = new Proton.Particle({mass:1,radius:100});
     * @constructor
     */
    function Particle(pOBJ) {
        /**
         * @property {Number}  id               - The particle's id
         */
        this.id = 'particle_' + Particle.ID++;
        this.name = 'Particle';
        this.reset("init");
        Util.setPrototypeByObj(this, pOBJ);
    }

    Particle.prototype = {
        getDirection: function() {
            return Math.atan2(this.v.x, -this.v.y) * (180 / Proton.PI);
        },

        /**
         * @property {Number}  life               - The particle's life
         * @property {Number}  age               - The particle's age
         * @property {Number}  energy               - The particle's energy loss
         * @property {Boolean}  dead               - The particle is dead?
         * @property {Boolean}  sleep               - The particle is sleep?
         * @property {Object}  target               - The particle's target
         * @property {Object}  body               - The particle's body
         * @property {Number}  mass               - The particle's mass
         * @property {Number}  radius               - The particle's radius
         * @property {Number}  alpha               - The particle's alpha
         * @property {Number}  scale               - The particle's scale
         * @property {Number}  rotation               - The particle's rotation
         * @property {String|Number}  color               - The particle's color
         * @property {Function}  easing               - The particle's easing
         * @property {Proton.Vector3D}  p               - The particle's position
         * @property {Proton.Vector3D}  v               - The particle's velocity
         * @property {Proton.Vector3D}  a               - The particle's acceleration
         * @property {Array}  behaviours               - The particle's behaviours array
         * @property {Object}  transform               - The particle's transform collection
         */
        reset: function(init) {
            this.life = Infinity;
            this.age = 0;
            //energy loss
            this.energy = 1;
            this.dead = false;
            this.sleep = false;
            this.body = null;
            this.parent = null;
            this.mass = 1;
            this.radius = 10;

            this.alpha = 1;
            this.scale = 1;

            this.useColor = false;
            this.useAlpha = false;

            this.easing = Proton.ease.setEasingByName(Proton.ease.easeLinear);

            if (init) {
                this.p = new Proton.Vector3D();
                this.v = new Proton.Vector3D();
                this.a = new Proton.Vector3D();
                this.old = {};
                this.old.p = this.p.clone();
                this.old.v = this.v.clone();
                this.old.a = this.a.clone();

                this.behaviours = [];
                this.transform = {};
                this.color = { r: 0, g: 0, b: 0 };
                this.rotation = new Proton.Vector3D;
            } else {
                this.p.set(0, 0, 0);
                this.v.set(0, 0, 0);
                this.a.set(0, 0, 0);
                this.old.p.set(0, 0, 0);
                this.old.v.set(0, 0, 0);
                this.old.a.set(0, 0, 0);

                this.color.r = 0;
                this.color.g = 0;
                this.color.b = 0;

                this.rotation.clear();

                Util.destroyObject(this.transform);
                this.removeAllBehaviours();
            }

            return this;
        },

        update: function(time, index) {
            if (!this.sleep) {
                this.age += time;

                var i = this.behaviours.length;
                while (i--) {
                    this.behaviours[i] && this.behaviours[i].applyBehaviour(this, time, index)
                }
            } else {
                //sleep
            }

            if (this.age >= this.life) {
                this.destroy();
            } else {
                var scale = this.easing(this.age / this.life);
                this.energy = Math.max(1 - scale, 0);
            }

        },

        addBehaviour: function(behaviour) {
            this.behaviours.push(behaviour);
            behaviour.initialize(this);
        },

        addBehaviours: function(behaviours) {
            var i = behaviours.length;
            while (i--) {
                this.addBehaviour(behaviours[i]);
            }
        },

        removeBehaviour: function(behaviour) {
            var index = this.behaviours.indexOf(behaviour);
            if (index > -1) {
                this.behaviours.splice(index, 1);
            }
        },

        removeAllBehaviours: function() {
            Util.destroyArray(this.behaviours);
        },

        /**
         * Destory this particle
         * @method destroy
         */
        destroy: function() {
            this.removeAllBehaviours();
            this.energy = 0;
            this.dead = true;
            this.parent = null;
        }
    };

    Proton.Particle = Particle;


    var Integration = function(type) {
        this.type = Util.initValue(type, Proton.EULER);
    }

    Integration.prototype = {
        integrate: function(particles, time, damping) {
            this.euler(particles, time, damping);
        },

        euler: function(particle, time, damping) {
            if (!particle.sleep) {
                particle.old.p.copy(particle.p);
                particle.old.v.copy(particle.v);
                particle.a.scalar(1 / particle.mass);
                particle.v.add(particle.a.scalar(time));
                particle.p.add(particle.old.v.scalar(time));
                damping && particle.v.scalar(damping);
                particle.a.clear();
            }
        }
    }

    Proton.Integration = Integration;

    var Vector3D = function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Vector3D.prototype = {
        set: function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        },

        setX: function(x) {
            this.x = x;
            return this;
        },

        setY: function(y) {
            this.y = y;
            return this;
        },

        setZ: function(z) {
            this.z = z;
            return this;
        },

        getGradient: function() {
            if (this.x !== 0)
                return Math.atan2(this.y, this.x);
            else if (this.y > 0)
                return Proton.PI / 2;
            else if (this.y < 0)
                return -Proton.PI / 2;
        },

        copy: function(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        },

        add: function(v, w) {
            if (w !== undefined) return this.addVectors(v, w);

            this.x += v.x;
            this.y += v.y;
            this.z += v.z;

            return this;

        },

        addValue: function(a, b, c) {
            this.x += a;
            this.y += b;
            this.z += c;

            return this;

        },

        addVectors: function(a, b) {
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;

            return this;
        },

        addScalar: function(s) {
            this.x += s;
            this.y += s;
            this.z += s;

            return this;
        },

        sub: function(v, w) {
            if (w !== undefined) return this.subVectors(v, w);

            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;

            return this;
        },

        subVectors: function(a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            return this;
        },

        scalar: function(s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;

            return this;
        },

        divideScalar: function(s) {
            if (s !== 0) {
                this.x /= s;
                this.y /= s;
                this.z /= s;
            } else {
                this.set(0, 0, 0);
            }

            return this;
        },

        negate: function() {
            return this.scalar(-1);
        },

        dot: function(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },

        cross: function(v) {
            var x = this.x,
                y = this.y,
                z = this.z;

            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;

            return this;
        },

        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },

        length: function() {
            return Math.sqrt(this.lengthSq());
        },

        normalize: function() {
            return this.divideScalar(this.length());
        },

        distanceTo: function(v) {
            return Math.sqrt(this.distanceToSquared(v));
        },

        crossVectors: function(a, b) {

            var ax = a.x,
                ay = a.y,
                az = a.z;
            var bx = b.x,
                by = b.y,
                bz = b.z;

            this.x = ay * bz - az * by;
            this.y = az * bx - ax * bz;
            this.z = ax * by - ay * bx;

            return this;

        },

        // eulerFromDir: function() {
        //     var quaternion, dir, up;

        //     return function rotateFromDir(direction) {
        //         if (quaternion === undefined) quaternion = new Proton.Quaternion();
        //         if (dir === undefined) dir = new Proton.Vector3D;
        //         if (up === undefined) up = new Proton.Vector3D(0, 0, 1);

        //         //quaternion.setFromUnitVectors(up, dir.copy(direction).normalize());
        //         console.log(quaternion.setFromUnitVectors(up, dir.copy(direction).normalize()));

        //         this.applyQuaternion(quaternion.setFromUnitVectors(up, dir.copy(direction).normalize()));
        //             console.log(this);
        //         return this;
        //     };
        // }(),

        eulerFromDir: function(dir) {
            
        },

        applyEuler: function() {
            var quaternion;

            return function applyEuler(euler) {
                if (quaternion === undefined) quaternion = new Proton.Quaternion();
                this.applyQuaternion(quaternion.setFromEuler(euler));
                return this;
            };
        }(),

        applyAxisAngle: function() {
            var quaternion;
            return function applyAxisAngle(axis, angle) {
                if (quaternion === undefined) quaternion = new Proton.Quaternion();
                this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
                return this;
            };
        }(),

        applyQuaternion: function(q) {
            var x = this.x;
            var y = this.y;
            var z = this.z;

            var qx = q.x;
            var qy = q.y;
            var qz = q.z;
            var qw = q.w;

            // calculate quat * vector

            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;

            // calculate result * inverse quat
            this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
        },

        distanceToSquared: function(v) {
            var dx = this.x - v.x,
                dy = this.y - v.y,
                dz = this.z - v.z;

            return dx * dx + dy * dy + dz * dz;
        },

        lerp: function(v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        },

        equals: function(v) {
            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        },

        clear: function() {
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            return this;
        },

        clone: function() {
            return new Proton.Vector3D(this.x, this.y, this.z);
        },

        toString: function() {
            return "x:" + this.x + "y:" + this.y + "z:" + this.z;
        }
    };

    Proton.Vector3D = Vector3D;

    var Polar3D = function(radius, theta, phi) {
        this.radius = radius || 1;
        this.phi = phi || 0;
        this.theta = theta || 0;
    }

    Polar3D.prototype = {
        set: function(radius, theta, phi) {
            this.radius = radius || 1;
            this.phi = phi || 0;
            this.theta = theta || 0;

            return this;
        },

        setRadius: function(radius) {
            this.radius = radius;
            return this;
        },

        setPhi: function(phi) {
            this.phi = phi;
            return this;
        },

        setTheta: function(theta) {
            this.theta = theta;
            return this;
        },

        copy: function(p) {
            this.radius = p.radius;
            this.phi = p.phi;
            this.theta = p.theta;
            return this;
        },

        toVector3D: function() {
            return new Proton.Vector3D(this.getX(), this.getY(), this.getZ());
        },

        getX: function() {
            return this.radius * Math.sin(this.theta) * Math.cos(this.phi);
        },

        getY: function() {
            return -this.radius * Math.sin(this.theta) * Math.sin(this.phi);
        },

        getZ: function() {
            return this.radius * Math.cos(this.theta);
        },

        normalize: function() {
            this.radius = 1;
            return this;
        },

        equals: function(v) {
            return ((v.radius === this.radius) && (v.phi === this.phi) && (v.theta === this.theta));
        },

        clear: function() {
            this.radius = 0.0;
            this.phi = 0.0;
            this.theta = 0.0;
            return this;
        },

        clone: function() {
            return new Polar3D(this.radius, this.phi, this.theta);
        }
    };


    Proton.Polar3D = Polar3D;

    var Quaternion = function(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = (w !== undefined) ? w : 1;
    };

    Quaternion.prototype = {
        set: function(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        },

        clone: function() {
            return new Proton.Quaternion(this.x, this.y, this.z, this.w);
        },

        copy: function(quaternion) {
            this.x = quaternion.x;
            this.y = quaternion.y;
            this.z = quaternion.z;
            this.w = quaternion.w;
            return this;
        },

        setFromEuler: function(euler) {
            // http://www.mathworks.com/matlabcentral/fileexchange/
            //  20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
            //  content/SpinCalc.m

            var c1 = Math.cos(euler.x / 2);
            var c2 = Math.cos(euler.y / 2);
            var c3 = Math.cos(euler.z / 2);
            var s1 = Math.sin(euler.x / 2);
            var s2 = Math.sin(euler.y / 2);
            var s3 = Math.sin(euler.z / 2);

            this.x = s1 * c2 * c3 + c1 * s2 * s3;
            this.y = c1 * s2 * c3 - s1 * c2 * s3;
            this.z = c1 * c2 * s3 + s1 * s2 * c3;
            this.w = c1 * c2 * c3 - s1 * s2 * s3;

            return this;

        },

        setFromAxisAngle: function(axis, angle) {
            // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
            // assumes axis is normalized
            var halfAngle = angle / 2,
                s = Math.sin(halfAngle);
            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos(halfAngle);

            return this;
        },

        // setFromUnitVectors: function() {
        //     var v1, r;
        //     var EPS = 0.000001;

        //     return function(vFrom, vTo) {
        //         if (v1 === undefined) v1 = new Proton.Vector3D();

        //         r = vFrom.dot(vTo) + 1;
        //         if (r < EPS) {
        //             r = 0;
        //             if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        //                 v1.set(-vFrom.y, vFrom.x, 0);
        //             } else {
        //                 v1.set(0, -vFrom.z, vFrom.y);
        //             }
        //         } else {
        //             v1.crossVectors(vFrom, vTo);
        //         }

        //         this.x = v1.x;
        //         this.y = v1.y;
        //         this.z = v1.z;
        //         this.w = r;
        //         return this.normalize();
        //     };
        // }(),

        normalize: function() {

            var l = this.length();

            if (l === 0) {

                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 1;

            } else {
                l = 1 / l;
                this.x *= l;
                this.y *= l;
                this.z *= l;
                this.w *= l;

            }
            return this;
        },

        length: function() {

            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

        },

        dot: function(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
        }
    };

    Proton.Quaternion = Quaternion;





    /**
     * Proton.createSpan function
     * @name get a instance of Span
     * @param {number} a min number
     * @param {number} b max number
     * @param {number} c center number
     * @return {number} return a instance of Span
     */
    Proton.createSpan = function(a, b, c) {
        if (a instanceof Span) return a;

        if (b === undefined) {
            return new Span(a);
        } else {
            if (c === undefined)
                return new Span(a, b);
            else
                return new Span(a, b, c);
        }
    }


     /**
     * ArraySpan name get a random Color from a colors array
     * @param {String|Array} colors - colors array
     * @example 
     * var span = new Proton.ArraySpan(["#fff","#ff0","#000"]);
     * or
     * var span = new Proton.ArraySpan("#ff0");
     * @extends {Proton.Span}
     * @constructor
     */

     function ArraySpan(colors) {
        this._arr = Util.isArray(colors) ? colors : [colors];
    }

    Util.inherits(ArraySpan, Span);

    /**
     * getValue function
     * @name get a random Color
     * @return {string} a hex color
     */
    ArraySpan.prototype.getValue = function() {
        var color = this._arr[(this._arr.length * Math.random()) >> 0];
        
        if (color === 'random' || color === 'Random')
            return MathUtils.randomColor();
        else
            return color;
    }

    /**
     * Proton.createArraySpan function
     * @name get a instance of Span
     * @param {number} a min number
     * @param {number} b max number
     * @param {number} c center number
     * @return {number} return a instance of Span
     */
    Proton.createArraySpan = function(arr) {
        if (!arr) return null;
        if (arr instanceof Proton.ArraySpan)
            return arr;
        else 
            return new Proton.ArraySpan(arr);
    }

    Proton.ArraySpan = ArraySpan;

    /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
    function Behaviour(life, easing) {
        /**
         * The behaviour's id;
         * @property id
         * @type {String} id
         */
        this.id = 'Behaviour_' + Behaviour.id++;
        this.life = Util.initValue(life, Infinity);

        /**
         * The behaviour's decaying trend, for example Proton.easeOutQuart;
         * @property easing
         * @type {String}
         * @default Proton.easeLinear
         */
        this.easing = Util.initValue(easing, Proton.ease.setEasingByName(Proton.ease.easeLinear));
        this.age = 0;
        this.energy = 1;
        /**
         * The behaviour is Dead;
         * @property dead
         * @type {Boolean}
         */
        this.dead = false;

        /**
         * The behaviour name;
         * @property name
         * @type {string}
         */

        this.name = 'Behaviour';
    }

    Behaviour.id = 0;


    Behaviour.prototype = {
        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @param {Number} this behaviour's life
         * @param {String} this behaviour's easing
         */
        reset: function(life, easing) {
            this.life = Util.initValue(life, Infinity);
            this.easing = Util.initValue(easing, Proton.ease.setEasingByName(Proton.ease.easeLinear));
        },
        /**
         * Normalize a force by 1:100;
         *
         * @method normalizeForce
         * @param {Proton.Vector2D} force 
         */
        normalizeForce: function(force) {
            return force.scalar(Proton.MEASURE);
        },

        /**
         * Normalize a value by 1:100;
         *
         * @method normalizeValue
         * @param {Number} value
         */
        normalizeValue: function(value) {
            return value * Proton.MEASURE;
        },

        /**
         * Initialize the behaviour's parameters for all particles
         *
         * @method initialize
         * @param {Proton.Particle} particle
         */
        initialize: function(particle) {},

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        applyBehaviour: function(particle, time, index) {
            if (this.dead) return;

            this.age += time;
            if (this.age >= this.life) {
                this.energy = 0;
                this.dead = true;
                return;
            }

            var scale = this.easing(particle.age / particle.life);
            this.energy = Math.max(1 - scale, 0);
        },

        /**
         * Destory this behaviour
         * @method destroy
         */
        destroy: function() {

        }
    };

    Proton.Behaviour = Behaviour;

    /**
     * The number of particles per second emission (a [particle]/b [s]);
     * @class Proton.Rate
     * @constructor
     * @param {Array or Number or Proton.Span} numPan the number of each emission;
     * @param {Array or Number or Proton.Span} timePan the time of each emission;
     * for example: new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(.1, .25));
     */
     
    function Rate(numPan, timePan) {
        this.numPan = Proton.createSpan(Util.initValue(numPan, 1));
        this.timePan = Proton.createSpan(Util.initValue(timePan, 1));

        this.startTime = 0;
        this.nextTime = 0;
        this.init();
    }

    Rate.prototype = {
        init: function() {
            this.startTime = 0;
            this.nextTime = this.timePan.getValue();
        },

        getValue: function(time) {
            this.startTime += time;

            if (this.startTime >= this.nextTime) {
                this.init();

                if (this.numPan.b === 1) {
                    if (this.numPan.getValue("Float") > 0.5)
                        return 1;
                    else
                        return 0;
                } else {
                    return this.numPan.getValue("Int");
                }
            }

            return 0;
        }
    }

    Proton.Rate = Rate;

    function Initialize() {
        this.name = "Initialize";
    }


    Initialize.prototype.reset = function() {

    }

    Initialize.prototype.init = function(emitter, particle) {
        if (particle) {
            this.initialize(particle);
        } else {
            this.initialize(emitter);
        }
    };

    ///sub class init
    Initialize.prototype.initialize = function(target) {};
    Proton.Initialize = Initialize;

    var InitializeUtil = {

        initialize(emitter, particle, initializes) {
            var i = initializes.length;
            while (i--) {
                var initialize = initializes[i];
                if (initialize instanceof Proton.Initialize)
                    initialize.init(emitter, particle);
                else
                    InitializeUtil.init(emitter, particle, initialize);
            }

            InitializeUtil.bindEmitter(emitter, particle);
        },
        init(emitter, particle, initialize) {
            Util.setPrototypeByObj(particle, initialize);
            Util.setVectorByObj(particle, initialize);
        },
        bindEmitter(emitter, particle) {
            if (emitter.bindEmitter) {
                particle.p.add(emitter.p);
                particle.v.add(emitter.v);
                particle.a.add(emitter.a);
                particle.v.applyEuler(emitter.rotation);
            }
        }
    }

    Proton.InitializeUtil = InitializeUtil;

    /**
     * Life is init particle's Life
     * @param {Number} a - the Life's start point
     * @param {Number} b - the Life's end point  
     * @param {String} c - span's center 
     * @example 
     * var life = new Proton.Life(3,5);
     * or
     * var life = new Proton.Life(Infinity);
     * @extends {Initialize}
     * @constructor
     */
    function Life(a, b, c) {
        Life._super_.call(this);
        this.lifePan = Proton.createSpan(a, b, c);
    }


    Util.inherits(Life, Proton.Initialize);
    Life.prototype.initialize = function(target) {
        if (this.lifePan.a === Infinity || this.lifePan.a === "infi")
            target.life = Infinity;
        else
            target.life = this.lifePan.getValue();
    };


    Proton.Life = Life;

    /**
     * Position is init particle's Position
     * @param {Zone} zone - the Position zone
     * @example 
     * var Position = new Proton.Position(new PointZone(30,100,0));
     * or
     * var Position = new Proton.Position(Infinity);
     * @extends {Proton.Initialize}
     * @constructor
     */
    function Position() {
        Position._super_.call(this);
        this.reset.apply(this, arguments);
    }


    Util.inherits(Position, Proton.Initialize);
    Position.prototype.reset = function() {
        if (!this.zones) this.zones = [];
        else this.zones.length = 0;

        var args = Array.prototype.slice.call(arguments);
        this.zones = this.zones.concat(args);
    };

    Position.prototype.addZone = function() {
        var args = Array.prototype.slice.call(arguments);
        this.zones = this.zones.concat(args);
    };

    Position.prototype.initialize = function() {
        var zone;
        return function(target) {
            var zone = this.zones[(Math.random() * this.zones.length) >> 0];
            zone.getPosition();

            target.p.x = zone.vector.x;
            target.p.y = zone.vector.y;
            target.p.z = zone.vector.z;
        }
    }();


    Proton.Position = Position;
    Proton.P = Position;

    /**
     * Velocity is init particle's Velocity
     * @param {Number} a - the Life's start point
     * @param {Number} b - the Life's end point  
     * @param {String} c - span's center 
     * @example 
     * var life = new Proton.Life(3,5);
     * or
     * var life = new Proton.Life(Infinity);
     * @extends {Initialize}
     * @constructor
     */
    //radius and tha
    function Velocity(a, b, c) {
        Velocity._super_.call(this);
        this.reset(a, b, c);
        this.dirVec = new Proton.Vector3D(0, 0, 0);

        this.name = "Velocity";
    }

    Util.inherits(Velocity, Proton.Initialize);

    Velocity.prototype.reset = function(a, b, c) {
        //[vector,tha]
        if (a instanceof Proton.Vector3D) {
            this.radiusPan = Proton.createSpan(1);
            this.dir = a.clone();
            this.tha = b * Proton.DR;
            this._useV = true;
        }

        //[polar,tha]
        else if (a instanceof Proton.Polar3D) {
            this.tha = b * Proton.DR;
            this.dirVec = a.toVector3D();
            this._useV = false;
        }

        //[radius,vector,tha]
        else {
            this.radiusPan = Proton.createSpan(a);
            this.dir = b.clone().normalize();
            this.tha = c * Proton.DR;
            this._useV = true;
        }
    };

    Velocity.prototype.normalize = function(vr) {
        return vr * Proton.MEASURE;
    }

    Velocity.prototype.initialize = function() {
        var tha;
        var normal = new Proton.Vector3D(0, 0, 1);
        var v = new Proton.Vector3D(0, 0, 0);

        return function initialize(target) {
            tha = this.tha * Math.random();
            this._useV && this.dirVec.copy(this.dir).scalar(this.radiusPan.getValue());

            MathUtils.getNormal(this.dirVec, normal);
            v.copy(this.dirVec).applyAxisAngle(normal, tha);
            v.applyAxisAngle(this.dirVec.normalize(), Math.random() * Proton.PI * 2);

            // use  axisRotate methods
            // MathUtils.axisRotate(this.v1, this.dirVec, normal, tha);
            // MathUtils.axisRotate(this.v2, this.v1, this.dirVec.normalize(), Math.random() * Proton.PI * 2);
            target.v.copy(v);
            return this;
        };
    }()

    Proton.Velocity = Velocity;
    Proton.V = Velocity;

    /**
     * Mass is init particle's Mass
     * @param {Number} a - the Mass's start point
     * @param {Number} b - the Mass's end point  
     * @param {String} c - span's center 
     * @example 
     * var Mass = new Proton.Mass(3,5);
     * or
     * var Mass = new Proton.Mass(Infinity);
     * @extends {Initialize}
     * @constructor
     */
    function Mass(a, b, c) {
        Mass._super_.call(this);
        this.massPan = Proton.createSpan(a, b, c);
    }


    Util.inherits(Mass, Proton.Initialize);
    Mass.prototype.initialize = function(target) {
        target.mass = this.massPan.getValue();
    };

    Proton.Mass = Mass;

    /**
     * Radius is init particle's Radius
     * @param {Number} a - the Radius's start point
     * @param {Number} b - the Radius's end point  
     * @param {String} c - span's center 
     * @example 
     * var Radius = new Proton.Radius(3,5);
     * or
     * var Radius = new Proton.Radius(3,1,"center");
     * @extends {Initialize}
     * @constructor
     */
    function Radius(a, b, c) {
        Radius._super_.call(this);
        this.radius = Proton.createSpan(a, b, c);
    }

    Util.inherits(Radius, Proton.Initialize);
    Radius.prototype.reset = function(a, b, c) {
        this.radius = Proton.createSpan(a, b, c);
    };

    Radius.prototype.initialize = function(particle) {
        particle.radius = this.radius.getValue();
        particle.transform.oldRadius = particle.radius;
    };

    Proton.Radius = Radius;

    function Body(body, w, h) {
        Body._super_.call(this);
        this.body = Proton.createArraySpan(body);
        this.w = w;
        this.h = Util.initValue(h, this.w);
    }
    Util.inherits(Body, Proton.Initialize);

    Body.prototype.initialize = function(particle) {
        var body = this.body.getValue();
        if (!!this.w) {
            particle.body = {
                width: this.w,
                height: this.h,
                body: body
            };
        } else {
            particle.body = body;
        }
    };

    Proton.Body = Body;

    /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
    function Force(fx, fy, fz, life, easing) {
        Force._super_.call(this, life, easing);
        Force.prototype.reset.call(this, fx, fy, fz);
        this.name = "Force";
    }

    Util.inherits(Force, Proton.Behaviour);
    Force.prototype.reset = function(fx, fy, fz) {
        this.force = this.normalizeForce(new Proton.Vector3D(fx, fy, fz));
        this.force.id = Math.random();
    }

    Force.prototype.applyBehaviour = function(particle, time, index) {
        Force._super_.prototype.applyBehaviour.call(this, particle, time, index);
        particle.a.add(this.force);
    };

    Proton.F = Proton.Force = Force;

    function Attraction(targetPosition, force, radius, life, easing) {
		Attraction._super_.call(this, life, easing);
		this.targetPosition = Util.initValue(targetPosition, new Proton.Vector3D);
		this.radius = Util.initValue(radius, 1000);
		this.force = Util.initValue(this.normalizeValue(force), 100);
		this.radiusSq = this.radius * this.radius
		this.attractionForce = new Proton.Vector3D();
		this.lengthSq = 0;
		this.name = "Attraction";
	}


	Util.inherits(Attraction, Proton.Behaviour);
	Attraction.prototype.reset = function(targetPosition, force, radius, life, easing) {
		this.targetPosition = Util.initValue(targetPosition, new Proton.Vector3D);
		this.radius = Util.initValue(radius, 1000);
		this.force = Util.initValue(this.normalizeValue(force), 100);
		this.radiusSq = this.radius * this.radius
		this.attractionForce = new Proton.Vector3D();
		this.lengthSq = 0;
		if (life)
			Attraction._super_.prototype.reset.call(this, life, easing);
	}

	Attraction.prototype.applyBehaviour = function(particle, time, index) {
		Attraction._super_.prototype.applyBehaviour.call(this, particle, time, index);
		this.attractionForce.copy(this.targetPosition);
		this.attractionForce.sub(particle.p);
		this.lengthSq = this.attractionForce.lengthSq();
		if (this.lengthSq > 0.000004 && this.lengthSq < this.radiusSq) {
			this.attractionForce.normalize();
			this.attractionForce.scalar(1 - this.lengthSq / this.radiusSq);
			this.attractionForce.scalar(this.force);
			particle.a.add(this.attractionForce);
		}
	};

	Proton.Attraction = Attraction;

     /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
     function RandomDrift(driftX, driftY, driftZ, delay, life, easing) {
        RandomDrift._super_.call(this, life, easing);
        this.reset(driftX, driftY, driftZ, delay);
        this.time = 0;
        this.name = "RandomDrift";
    }


    Util.inherits(RandomDrift, Proton.Behaviour);
    RandomDrift.prototype.reset = function(driftX, driftY, driftZ, delay, life, easing) {
        this.randomFoce = this.normalizeForce(new Proton.Vector3D(driftX, driftY, driftZ));
        this.delayPan = Proton.createSpan(delay || .03);
        this.time = 0;
        life && RandomDrift._super_.prototype.reset.call(this, life, easing);
    }

    RandomDrift.prototype.applyBehaviour = function(particle, time, index) {
        RandomDrift._super_.prototype.applyBehaviour.call(this, particle, time, index);

        this.time += time;
        if (this.time >= this.delayPan.getValue()) {
            var ax = MathUtils.randomAToB(-this.randomFoce.x, this.randomFoce.x);
            var ay = MathUtils.randomAToB(-this.randomFoce.y, this.randomFoce.y);
            var az = MathUtils.randomAToB(-this.randomFoce.z, this.randomFoce.z);
            particle.a.addValue(ax, ay, az);
            this.time = 0;
        };
    };

    Proton.RandomDrift = RandomDrift;

    function Repulsion(targetPosition, force, radius, life, easing) {
		Repulsion._super_.call(this, targetPosition, force, radius, life, easing);
		this.force *= -1;
		this.name = "Repulsion";
	}


	Util.inherits(Repulsion, Proton.Attraction);
	Repulsion.prototype.reset = function(targetPosition, force, radius, life, easing) {
		Repulsion._super_.prototype.reset.call(this, targetPosition, force, radius, life, easing);
		this.force *= -1;
	}
	Proton.Repulsion = Repulsion;

    function Gravity(g, life, easing) {
        Gravity._super_.call(this, 0, -g, 0, life, easing);
        this.name = "Gravity";
    }

    Util.inherits(Gravity, Proton.Force);

    Gravity.prototype.reset = function(g, life, easing) {
        Gravity._super_.prototype.reset.call(this, 0, -g, 0, life, easing);
    }

    Proton.Gravity = Gravity;
    Proton.G = Gravity;

        /**
     * The Scale class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */
    //can use Collision(emitter,true,function(){}) or Collision();
    function Collision(emitter, useMass, callback, life, easing) {
        Collision._super_.call(this, life, easing);
        this.reset(emitter, useMass, callback);
        this.name = "Collision";
    }

    Util.inherits(Collision, Proton.Behaviour);
    Collision.prototype.reset = function(emitter, useMass, callback, life, easing) {
        this.emitter = emitter;
        this.useMass = useMass;
        this.callback = callback;
        this.particles = [];
        this.delta = new Proton.Vector3D();
        life && Collision._super_.prototype.reset.call(this, life, easing);
    }

    Collision.prototype.applyBehaviour = function(particle, time, index) {
        var particles = this.emitter ? this.emitter.particles.slice(index) : this.particles.slice(index);
        var otherParticle, lengthSq, overlap, distance;
        var averageMass1, averageMass2;
        
        var i = particles.length;
        while (i--) {
            otherParticle = particles[i];
            if (otherParticle === particle) continue;
            
            this.delta.copy(otherParticle.p).sub(particle.p);
            lengthSq = this.delta.lengthSq();
            distance = particle.radius + otherParticle.radius;

            if (lengthSq <= distance * distance) {
                overlap = distance - Math.sqrt(lengthSq);
                overlap += 0.5;

                averageMass1 = this._getAverageMass(particle, otherParticle);
                averageMass2 = this._getAverageMass(otherParticle, particle);

                particle.p.add(this.delta.clone().normalize().scalar(overlap * -averageMass1));
                otherParticle.p.add(this.delta.normalize().scalar(overlap * averageMass2));

                this.callback && this.callback(particle, otherParticle);
            }
        }
    };

    Collision.prototype._getAverageMass = function(aPartcile, bParticle) {
        return this.useMass ? bParticle.mass / (aPartcile.mass + bParticle.mass) : 0.5;
    }

    Proton.Collision = Collision;

    function CrossZone(a, b, life, easing) {
        CrossZone._super_.call(this, life, easing);
        this.reset(a, b);
        ///dead /bound /cross
        this.name = "CrossZone";
    }


    Util.inherits(CrossZone, Proton.Behaviour);
    CrossZone.prototype.reset = function(a, b, life, easing) {
        var zone, crossType;
        if (typeof a === "string") {
            crossType = a;
            zone = b;
        } else {
            crossType = b;
            zone = a;
        }
        
        this.zone = zone;
        this.zone.crossType = Util.initValue(crossType, "dead");
        if (life)
            CrossZone._super_.prototype.reset.call(this, life, easing);
    }

    CrossZone.prototype.applyBehaviour = function(particle, time, index) {
        CrossZone._super_.prototype.applyBehaviour.call(this, particle, time, index);
        this.zone.crossing.call(this.zone, particle);
    };

    Proton.CrossZone = CrossZone;

     /**
     * The Alpha class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */

     function Alpha(a, b, life, easing) {
        Alpha._super_.call(this, life, easing);
        this.reset(a, b);
        /**
         * The Proton.Behaviour name;
         * @property name
         * @type {string}
         */
        this.name = "Alpha";
    }


    Util.inherits(Alpha, Proton.Behaviour);
    Alpha.prototype.reset = function(a, b, life, easing) {
        if (b === null || b === undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createSpan(Util.initValue(a, 1));
        this.b = Proton.createSpan(b);
        life && Alpha._super_.prototype.reset.call(this, life, easing);
    }

    Alpha.prototype.initialize = function(particle) {
        particle.useAlpha = true;
        particle.transform.alphaA = this.a.getValue();
        if (this._same)
            particle.transform.alphaB = particle.transform.alphaA;
        else
            particle.transform.alphaB = this.b.getValue();
    };

    Alpha.prototype.applyBehaviour = function(particle, time, index) {
        Alpha._super_.prototype.applyBehaviour.call(this, particle, time, index);

        particle.alpha = MathUtils.lerp(particle.transform.alphaA, particle.transform.alphaB, this.energy);
        if (particle.alpha < 0.002) particle.alpha = 0;
    };

    Proton.Alpha = Alpha;

    /**
     * The Scale class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */

    function Scale(a, b, life, easing) {
        Scale._super_.call(this, life, easing);
        this.reset(a, b);
        this.name = "Scale";
    }


    Util.inherits(Scale, Proton.Behaviour);
    Scale.prototype.reset = function(a, b, life, easing) {
        if (b === null || b === undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createSpan(Util.initValue(a, 1));
        this.b = Proton.createSpan(b);

        life && Scale._super_.prototype.reset.call(this, life, easing);
    }

    Scale.prototype.initialize = function(particle) {
        particle.transform.scaleA = this.a.getValue();
        particle.transform.oldRadius = particle.radius;
        if (this._same)
            particle.transform.scaleB = particle.transform.scaleA;
        else
            particle.transform.scaleB = this.b.getValue();

    };

    Scale.prototype.applyBehaviour = function(particle, time, index) {
        Scale._super_.prototype.applyBehaviour.call(this, particle, time, index);
        particle.scale = MathUtils.lerp(particle.transform.scaleA, particle.transform.scaleB, this.energy);

        if (particle.scale < 0.0005) particle.scale = 0;
        particle.radius = particle.transform.oldRadius * particle.scale;
    };

    Proton.Scale = Scale;

    /* The Rotate class is the base
     * for the other Behaviour
     *
     * @class Behaviour * @constructor 
     * @example new Proton.Rotate(Proton.createSpan(-1,1),Proton.createSpan(-1,1),Proton.createSpan(-1,1)); 
     * @example new Proton.Rotate(); 
     * @example new Proton.Rotate("random"); 
     */

    function Rotate(x, y, z, life, easing) {
        Rotate._super_.call(this, life, easing);
        this.reset(x, y, z);
        this.name = "Rotate";
    }

    Util.inherits(Rotate, Proton.Behaviour);
    Rotate.prototype.reset = function(a, b, c, life, easing) {
        this.a = a || 0;
        this.b = b || 0;
        this.c = c || 0;

        if (a === undefined || a === "same") {
            this._type = "same";
        } else if (b === undefined) {
            this._type = "set";
        } else if (c === undefined) {
            this._type = "to";
        } else {
            this._type = "add";
            this.a = Proton.createSpan(this.a * Proton.DR);
            this.b = Proton.createSpan(this.b * Proton.DR);
            this.c = Proton.createSpan(this.c * Proton.DR);
        }

        life && Rotate._super_.prototype.reset.call(this, life, easing);
    }

    Rotate.prototype.initialize = function(particle) {
        switch (this._type) {
            case "same":
                break;

            case "set":
                this._setRotation(particle.rotation, this.a);
                break;

            case "to":
                particle.transform.fR = particle.transform.fR || new Proton.Vector3D;
                particle.transform.tR = particle.transform.tR || new Proton.Vector3D;
                this._setRotation(particle.transform.fR, this.a);
                this._setRotation(particle.transform.tR, this.b);
                break;

            case "add":
                particle.transform.addR = new Proton.Vector3D(this.a.getValue(), this.b.getValue(), this.c.getValue());
                break;
        }
    };

    Rotate.prototype._setRotation = function(vec3, value) {
        vec3 = vec3 || new Proton.Vector3D;
        if (value === "random") {
            var x = MathUtils.randomAToB(-Proton.PI, Proton.PI);
            var y = MathUtils.randomAToB(-Proton.PI, Proton.PI);
            var z = MathUtils.randomAToB(-Proton.PI, Proton.PI);
            vec3.set(x, y, z);
        } else if (value instanceof Proton.Vector3D) {
            vec3.copy(value);
        }
    };

    Rotate.prototype.applyBehaviour = function(particle, time, index) {
        Rotate._super_.prototype.applyBehaviour.call(this, particle, time, index);

        switch (this._type) {
            case "same":
                if (!particle.rotation) particle.rotation = new Proton.Vector3D;
                particle.rotation.eulerFromDir(particle.v);
                //http://stackoverflow.com/questions/21622956/how-to-convert-direction-vector-to-euler-angles
                //console.log(particle.rotation);
                break;

            case "set":
                //
                break;

            case "to":
                particle.rotation.x = MathUtils.lerp(particle.transform.fR.x, particle.transform.tR.x, this.energy);
                particle.rotation.y = MathUtils.lerp(particle.transform.fR.y, particle.transform.tR.y, this.energy);
                particle.rotation.z = MathUtils.lerp(particle.transform.fR.z, particle.transform.tR.z, this.energy);
                break;
            case "add":
                particle.rotation.add(particle.transform.addR);
                break;
        }
    };

    Proton.Rotate = Rotate;

    /**
     * The Scale class is the base for the other Proton.Behaviour
     *
     * @class Proton.Behaviour
     * @constructor
     */
    function Color(a, b, life, easing) {
        Color._super_.call(this, life, easing);
        this.reset(a, b);
        this.name = "Color";
    }


    Util.inherits(Color, Proton.Behaviour);
    Color.prototype.reset = function(a, b, life, easing) {
        if (b === null || b === undefined)
            this._same = true;
        else
            this._same = false;

        this.a = Proton.createArraySpan(a);
        this.b = Proton.createArraySpan(b);
        life && Color._super_.prototype.reset.call(this, life, easing);
    }

    Color.prototype.initialize = function(particle) {
        particle.transform.colorA = ColorUtil.getRGB(this.a.getValue());

        particle.useColor = true;
        if (this._same)
            particle.transform.colorB = particle.transform.colorA;
        else
            particle.transform.colorB = ColorUtil.getRGB(this.b.getValue());
    };

    Color.prototype.applyBehaviour = function(particle, time, index) {
        Color._super_.prototype.applyBehaviour.call(this, particle, time, index);

        if (!this._same) {
            particle.color.r = MathUtils.lerp(particle.transform.colorA.r, particle.transform.colorB.r, this.energy) ;
            particle.color.g = MathUtils.lerp(particle.transform.colorA.g, particle.transform.colorB.g, this.energy) ;
            particle.color.b = MathUtils.lerp(particle.transform.colorA.b, particle.transform.colorB.b, this.energy) ;
        } else {
            particle.color.r = particle.transform.colorA.r;
            particle.color.g = particle.transform.colorA.g;
            particle.color.b = particle.transform.colorA.b;
        }
    };


    Proton.Color = Color;

     /**
     * The Behaviour class is the base for the other Behaviour
     *
     * @class Behaviour
     * @constructor
     */
     function Spring(x, y, z, spring, friction, life, easing) {
        Spring._super_.call(this, life, easing);
        Spring.prototype.reset(x, y, z, spring, friction);
        this.name = "Spring";
    }

    Util.inherits(Spring, Proton.Behaviour);
    Spring.prototype.reset = function(x, y, z, spring, friction) {
        if (!this.pos)
            this.pos = new Proton.Vector3D(x, y, z);
        else
            this.pos.set(x, y, z);
        this.spring = spring || .1;
        this.friction = friction || .98;
    }

    Spring.prototype.applyBehaviour = function(particle, time, index) {
        Spring._super_.prototype.applyBehaviour.call(this, particle, time, index);

        particle.v.x += (this.pos.x - particle.p.x) * this.spring;
        particle.v.y += (this.pos.y - particle.p.y) * this.spring;
        particle.v.z += (this.pos.z - particle.p.z) * this.spring;

    };


    Proton.Spring = Spring;

    function Emitter(pObj) {
        this.initializes = [];
        this.particles = [];
        this.behaviours = [];
        this.currentEmitTime = 0;
        this.totalEmitTimes = -1;

        /**
         * @property {Number} damping -The friction coefficient for all particle emit by This;
         * @default 0.006
         */
        this.damping = .006;
        /**
         * If bindEmitter the particles can bind this emitter's property;
         * @property bindEmitter
         * @type {Boolean}
         * @default true
         */
        this.bindEmitter = true;
        /**
         * The number of particles per second emit (a [particle]/b [s]);
         * @property rate
         * @type {Rate}
         * @default Rate(1, .1)
         */
        this.rate = new Proton.Rate(1, .1);
        Emitter._super_.call(this, pObj);
        /**
         * The emitter's id;
         * @property id
         * @type {String} id
         */
        this.id = 'emitter_' + Emitter.ID++;
        this.cID = 0;
        this.name = 'Emitter';
    };
    Emitter.ID = 0;

    Util.inherits(Emitter, Proton.Particle);
    Proton.EventDispatcher.initialize(Emitter.prototype);

    /**
     * start emit particle
     * @method emit
     * @param {Number} totalEmitTimes total emit times;
     * @param {String} life the life of this emitter
     */
    Emitter.prototype.emit = function(totalEmitTimes, life) {
        this.currentEmitTime = 0;
        this.totalEmitTimes = Util.initValue(totalEmitTimes, Infinity);

        if (life === true || life === 'life' || life === 'destroy') {
            this.life = totalEmitTimes === 'once' ? 1 : this.totalEmitTimes;
        } else if (!isNaN(life)) {
            this.life = life;
        }

        this.rate.init();
    };

    /**
     * stop emiting
     * @method stopEmit
     */
    Emitter.prototype.stopEmit = function() {
        this.totalEmitTimes = -1;
        this.currentEmitTime = 0;
    };

    /**
     * remove current all particles
     * @method removeAllParticles
     */
    Emitter.prototype.removeAllParticles = function() {
        var i = this.particles.length;
        while (i--) this.particles[i].dead = true;
    };

    /**
     * create single particle;
     * 
     * can use emit({x:10},new Gravity(10),{'particleUpdate',fun}) or emit([{x:10},new Initialize],new Gravity(10),{'particleUpdate',fun})
     * @method removeAllParticles
     */
    Emitter.prototype.createParticle = function(initialize, behaviour) {
        var particle = this.parent.pool.get(Proton.Particle);
        this.setupParticle(particle, initialize, behaviour);
        this.parent && this.parent.dispatchEvent("PARTICLE_CREATED", particle);
        Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_CREATED", particle);

        return particle;
    };
    /**
     * add initialize to this emitter
     * @method addSelfInitialize
     */
    Emitter.prototype.addSelfInitialize = function(pObj) {
        if (pObj['init']) {
            pObj.init(this);
        } else {
            this.initAll();
        }
    };


    /**
     * add the Initialize to particles;
     * 
     * you can use initializes array:for example emitter.addInitialize(initialize1,initialize2,initialize3);
     * @method addInitialize
     * @param {Initialize} initialize like this new Radius(1, 12)
     */
    Emitter.prototype.addInitialize = function() {
        var i = arguments.length;
        while (i--) this.initializes.push(arguments[i]);
    };


    /**
     * remove the Initialize
     * @method removeInitialize
     * @param {Initialize} initialize a initialize
     */
    Emitter.prototype.removeInitialize = function(initializer) {
        var index = this.initializes.indexOf(initializer);
        if (index > -1) this.initializes.splice(index, 1);
    };

    /**
     * remove all Initializes
     * @method removeInitializers
     */
    Emitter.prototype.removeInitializers = function() {
        Util.destroyArray(this.initializes);
    };
    /**
     * add the Behaviour to particles;
     * 
     * you can use Behaviours array:emitter.addBehaviour(Behaviour1,Behaviour2,Behaviour3);
     * @method addBehaviour
     * @param {Behaviour} behaviour like this new Color('random')
     */
    Emitter.prototype.addBehaviour = function() {
        var i = arguments.length;
        while (i--) this.behaviours.push(arguments[i]);
    };
    /**
     * remove the Behaviour
     * @method removeBehaviour
     * @param {Behaviour} behaviour a behaviour
     */
    Emitter.prototype.removeBehaviour = function(behaviour) {
        var index = this.behaviours.indexOf(behaviour);
        if (index > -1) this.behaviours.splice(index, 1);
    };
    /**
     * remove all behaviours
     * @method removeAllBehaviours
     */
    Emitter.prototype.removeAllBehaviours = function() {
        Util.destroyArray(this.behaviours);
    };

    Emitter.prototype.integrate = function(time) {
        var damping = 1 - this.damping;
        Proton.integrator.integrate(this, time, damping);

        var i = this.particles.length;
        while (i--) {
            var particle = this.particles[i];
            particle.update(time, i);
            Proton.integrator.integrate(particle, time, damping);

            this.parent && this.parent.dispatchEvent("PARTICLE_UPDATE", particle);
            Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_UPDATE", particle);
        }
    };

    Emitter.prototype.emitting = function(time) {
        if (this.totalEmitTimes === 'once') {
            var i = this.rate.getValue(99999);
            if (i > 0) this.cID = i;
            while (i--) this.createParticle();
            this.totalEmitTimes = 'none';

        } else if (!isNaN(this.totalEmitTimes)) {
            this.currentEmitTime += time;
            if (this.currentEmitTime < this.totalEmitTimes) {
                var i = this.rate.getValue(time);
                if (i > 0) this.cID = i;
                while (i--) this.createParticle();
            }
        }
    }

    Emitter.prototype.update = function(time) {
        this.age += time;
        if (this.dead || this.age >= this.life) {
            this.destroy();
        }

        this.emitting(time);
        this.integrate(time);

        var particle, i = this.particles.length;
        while (i--) {
            particle = this.particles[i];
            if (particle.dead) {
                this.parent && this.parent.dispatchEvent("PARTICLE_DEAD", particle);
                Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_DEAD", particle);

                this.parent.pool.expire(particle.reset());
                this.particles.splice(i, 1);
            }
        }
    };

    Emitter.prototype.setupParticle = function(particle, initialize, behaviour) {
        var initializes = this.initializes;
        var behaviours = this.behaviours;

        if (initialize) {
            if (Util.isArray(initialize))
                initializes = initialize;
            else
                initializes = [initialize];
        }

        if (behaviour) {
            if (Util.isArray(behaviour))
                behaviours = behaviour;
            else
                behaviours = [behaviour];
        }

        Proton.InitializeUtil.initialize(this, particle, initializes);
        particle.addBehaviours(behaviours);
        particle.parent = this;
        this.particles.push(particle);
    };

    /**
     * Destory this Emitter
     * @method destroy
     */
    Emitter.prototype.destroy = function() {
        this.dead = true;
        this.energy = 0;
        this.totalEmitTimes = -1;

        if (this.particles.length === 0) {
            this.removeInitializers();
            this.removeAllBehaviours();

            this.parent && this.parent.removeEmitter(this);
        }
    }


    Proton.Emitter = Emitter;

    /**
     * The BehaviourEmitter class inherits from Proton.Emitter
     *
     * use the BehaviourEmitter you can add behaviours to self;
     * @class Proton.BehaviourEmitter
     * @constructor
     * @param {Object} pObj the parameters object;
     */
    function BehaviourEmitter(pObj) {
        this.selfBehaviours = [];
        BehaviourEmitter._super_.call(this, pObj);
    };

    Util.inherits(BehaviourEmitter, Proton.Emitter);
    /**
     * add the Behaviour to emitter;
     *
     * you can use Behaviours array:emitter.addSelfBehaviour(Behaviour1,Behaviour2,Behaviour3);
     * @method addSelfBehaviour
     * @param {Proton.Behaviour} behaviour like this new Proton.Color('random')
     */
    BehaviourEmitter.prototype.addSelfBehaviour = function() {
        var length = arguments.length,
            i;
        for (i = 0; i < length; i++) {
            this.selfBehaviours.push(arguments[i]);
        }
    };
    /**
     * remove the Behaviour for self
     * @method removeSelfBehaviour
     * @param {Proton.Behaviour} behaviour a behaviour
     */
    BehaviourEmitter.prototype.removeSelfBehaviour = function(behaviour) {
        var index = this.selfBehaviours.indexOf(behaviour);
        if (index > -1) this.selfBehaviours.splice(index, 1);
    };

    BehaviourEmitter.prototype.update = function(time) {
        BehaviourEmitter._super_.prototype.update.call(this, time);

        if (!this.sleep) {
            var length = this.selfBehaviours.length,
                i;
            for (i = 0; i < length; i++) {
                this.selfBehaviours[i].applyBehaviour(this, time, i)
            }
        }
    }

    Proton.BehaviourEmitter = BehaviourEmitter;

    /**
     * The FollowEmitter class inherits from Proton.Emitter
     *
     * use the FollowEmitter will emit particle when mousemoving
     *
     * @class Proton.FollowEmitter
     * @constructor
     * @param {Element} mouseTarget mouseevent's target;
     * @param {Number} ease the easing of following speed;
     * @default 0.7
     * @param {Object} pObj the parameters object;
     */
    function FollowEmitter(mouseTarget, ease, pObj) {
        this.mouseTarget = Util.initValue(mouseTarget, window);
        this.ease = Util.initValue(ease, .7);
        this._allowEmitting = false;
        this.mouse = new Proton.Vector3D();
        this.initEventHandler();

        FollowEmitter._super_.call(this, pObj);
    };

    Util.inherits(FollowEmitter, Proton.Emitter);
    FollowEmitter.prototype.initEventHandler = function() {
        var self = this;
        this.mousemoveHandler = function(e) {
            self.mousemove.call(self, e);
        };

        this.mousedownHandler = function(e) {
            self.mousedown.call(self, e);
        };

        this.mouseupHandler = function(e) {
            self.mouseup.call(self, e);
        };
        
        this.mouseTarget.addEventListener('mousemove', this.mousemoveHandler, false);
    }

    /**
     * start emit particle
     * @method emit
     */
    FollowEmitter.prototype.emit = function() {
        this._allowEmitting = true;
    }

    /**
     * stop emiting
     * @method stopEmit
     */
    FollowEmitter.prototype.stopEmit = function() {
        this._allowEmitting = false;
    }

    FollowEmitter.prototype.setCameraAndCanvas = function(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
    }

    FollowEmitter.prototype.setCameraAndRenderer = function(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.canvas = renderer.domElement;
    }

    FollowEmitter.prototype.mousemove = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var ratio = this.renderer? this.renderer.getPixelRatio() : 1;
        x *= ratio;
        y *= ratio;

        this.mouse.x += (x - this.mouse.x) * this.ease;
        this.mouse.y += (y - this.mouse.y) * this.ease;
        
        this.p.copy(THREEUtil.toSpacePos(this.mouse, this.camera, this.canvas, this.renderer));

        if (this._allowEmitting){
            FollowEmitter._super_.prototype.emit.call(this, 'once');
        }
    };

    /**
     * Destory this Emitter
     * @method destroy
     */
    FollowEmitter.prototype.destroy = function() {
        FollowEmitter._super_.prototype.destroy.call(this);
        this.mouseTarget.removeEventListener('mousemove', this.mousemoveHandler, false);
    }

    Proton.FollowEmitter = FollowEmitter;

    /**
     * The Ease class provides a collection of easing functions for use with Proton
     */
    var ease = ease || {
        easeLinear: function(value) {
            return value;
        },

        easeInQuad: function(value) {
            return Math.pow(value, 2);
        },

        easeOutQuad: function(value) {
            return -(Math.pow((value - 1), 2) - 1);
        },

        easeInOutQuad: function(value) {
            if ((value /= 0.5) < 1)
                return 0.5 * Math.pow(value, 2);
            return -0.5 * ((value -= 2) * value - 2);
        },

        easeInCubic: function(value) {
            return Math.pow(value, 3);
        },

        easeOutCubic: function(value) {
            return (Math.pow((value - 1), 3) + 1);
        },

        easeInOutCubic: function(value) {
            if ((value /= 0.5) < 1)
                return 0.5 * Math.pow(value, 3);
            return 0.5 * (Math.pow((value - 2), 3) + 2);
        },

        easeInQuart: function(value) {
            return Math.pow(value, 4);
        },

        easeOutQuart: function(value) {
            return -(Math.pow((value - 1), 4) - 1);
        },

        easeInOutQuart: function(value) {
            if ((value /= 0.5) < 1)
                return 0.5 * Math.pow(value, 4);
            return -0.5 * ((value -= 2) * Math.pow(value, 3) - 2);
        },

        easeInSine: function(value) {
            return -Math.cos(value * (Proton.PI / 2)) + 1;
        },

        easeOutSine: function(value) {
            return Math.sin(value * (Proton.PI / 2));
        },

        easeInOutSine: function(value) {
            return (-0.5 * (Math.cos(Proton.PI * value) - 1));
        },

        easeInExpo: function(value) {
            return (value === 0) ? 0 : Math.pow(2, 10 * (value - 1));
        },

        easeOutExpo: function(value) {
            return (value === 1) ? 1 : -Math.pow(2, -10 * value) + 1;
        },

        easeInOutExpo: function(value) {
            if (value === 0)
                return 0;
            if (value === 1)
                return 1;
            if ((value /= 0.5) < 1)
                return 0.5 * Math.pow(2, 10 * (value - 1));
            return 0.5 * (-Math.pow(2, -10 * --value) + 2);
        },

        easeInCirc: function(value) {
            return -(Math.sqrt(1 - (value * value)) - 1);
        },

        easeOutCirc: function(value) {
            return Math.sqrt(1 - Math.pow((value - 1), 2));
        },

        easeInOutCirc: function(value) {
            if ((value /= 0.5) < 1)
                return -0.5 * (Math.sqrt(1 - value * value) - 1);
            return 0.5 * (Math.sqrt(1 - (value -= 2) * value) + 1);
        },

        easeInBack: function(value) {
            var s = 1.70158;
            return (value) * value * ((s + 1) * value - s);
        },

        easeOutBack: function(value) {
            var s = 1.70158;
            return (value = value - 1) * value * ((s + 1) * value + s) + 1;
        },

        easeInOutBack: function(value) {
            var s = 1.70158;
            if ((value /= 0.5) < 1)
                return 0.5 * (value * value * (((s *= (1.525)) + 1) * value - s));
            return 0.5 * ((value -= 2) * value * (((s *= (1.525)) + 1) * value + s) + 2);
        },

        setEasingByName: function(easeName) {
            if (!!ease[easeName])
                return ease[easeName];
            else
                return ease.easeLinear;
        }
    }


    for (var id in ease) {
        if (id !== "setEasingByName") Proton[id] = ease[id];
    }

    Proton.ease = ease;



     /**
     * Zone is a base class.
     * @constructor
     */
     class Zone {
        constructor() {
            this.vector = new Proton.Vector3D(0, 0, 0);
            this.random = 0;
            this.crossType = "dead";
            this.log = true;
        }
        getPosition() {
            return null;
        }

        crossing(particle) {
            switch (this.crossType) {
                case "bound":
                    this._bound(particle);
                    break;

                case "cross":
                    this._cross(particle);
                    break;

                case "dead":
                    this._dead(particle);
                    break;
            }
        }

        _dead(particle) {}
        _bound(particle) {}
        _cross(particle) {}
     }

    /**
     * LineZone is a 3d line zone
     * @param {Number|Vector3D} x1 - the line's start point of x value or a Vector3D Object
     * @param {Number|Vector3D} y1 - the line's start point of y value or a Vector3D Object
     * @param {Number} z1 - the line's start point of z value 
     * @param {Number} x2 - the line's end point of x value 
     * @param {Number} y2 - the line's end point of y value 
     * @param {Number} z2 - the line's end point of z value 
     * @example 
     * var lineZone = new Proton.LineZone(0,0,0,100,100,0);
     * or
     * var lineZone = new Proton.LineZone(new Proton.Vector3D(0,0,0),new Proton.Vector3D(100,100,0));
     * @extends {Zone}
     * @constructor
     */
    export class LineZone extends Zone {
        constructor(x1, y1, z1, x2, y2, z2) {
            super();
            if (x1 instanceof Proton.Vector3D) {
                this.x1 = x1.x;
                this.y1 = x1.y;
                this.z1 = x1.z;
    
                this.x2 = x2.x;
                this.y2 = x2.y;
                this.z2 = x2.z;
            } else {
                this.x1 = x1;
                this.y1 = y1;
                this.z1 = z1;
    
                this.x2 = x2;
                this.y2 = y2;
                this.z2 = z2;
            }
        }
        getPosition() {
            this.random = Math.random();
            this.vector.x = this.x1 + this.random * (this.x2 - this.x1);
            this.vector.y = this.y1 + this.random * (this.y2 - this.y1);
            this.vector.z = this.z1 + this.random * (this.z2 - this.z1);
            return this.vector;
        }
    
        crossing(particle) {
            if (this.log) {
                console.error('Sorry LineZone does not support crossing method');
                this.log = false;
            }
        }
    
        
    }
    Proton.LineZone = LineZone;

    /**
     * SphereZone is a sphere zone
     * @param {Number|Vector3D} x - the center's x value or a Vector3D Object
     * @param {Number} y - the center's y value or the Sphere's radius 
     * @param {Number} z - the center's z value 
     * @param {Number} r - the Sphere's radius 
     * @example 
     * var sphereZone = new Proton.SphereZone(0,0,0,100);
     * var sphereZone = new Proton.SphereZone(new Proton.Vector3D(0,0,0),100);
     * @extends {Proton.Zone}
     * @constructor
     */
    export class SphereZone extends Zone {
        constructor(a, b, c, d) {
            var x, y, z, r;
            super()
            if (Util.isUndefined(b, c, d)) {
                x = y = z = 0;
                r = (a || 100);
            } else {
                x = a;
                y = b;
                z = c;
                r = d;
            }
    
            this.x = x;
            this.y = x;
            this.z = x;
            this.radius = r;
            this.tha = this.phi = 0;
        }
        getPosition = function() {
            var tha, phi, r;
            return function() {
                this.random = Math.random();
    
                r = this.random * this.radius;
                tha = Proton.PI * Math.random(); //[0-pi]
                phi = Proton.PI * 2 * Math.random(); //[0-2pi]
    
                this.vector.x = this.x + r * Math.sin(tha) * Math.cos(phi);
                this.vector.y = this.y + r * Math.sin(phi) * Math.sin(tha);
                this.vector.z = this.z + r * Math.cos(tha);
    
                return this.vector;
            }
        }();
    
        _dead(particle) {
            var d = particle.p.distanceTo(this);
            if (d - particle.radius > this.radius) particle.dead = true;
        }
    
        _bound = function() {
            var normal = new Proton.Vector3D,
                v = new Proton.Vector3D,
                k;
    
            return function(particle) {
                var d = particle.p.distanceTo(this);
                if (d + particle.radius >= this.radius) {
                    normal.copy(particle.p).sub(this).normalize();
                    v.copy(particle.v);
                    k = 2 * v.dot(normal);
                    particle.v.sub(normal.scalar(k));
                }
            }
        }();
    
        _cross(particle) {
            if (this.log) {
                console.error('Sorry SphereZone does not support _cross method');
                this.log = false;
            }
        }
    }

    /**
     * PointZone is a point zone
     * @param {Number|Vector3D} x - the center's x value or a Vector3D Object
     * @param {Number} y - the center's y value
     * @param {Number} z - the center's z value  
     * @example 
     * var pointZone = new PointZone(0,30,10);
     * or
     * var pointZone = new PointZone(new Proton.Vector3D(0,30,10));
     * @extends {Zone}
     * @constructor
     */
    export class PointZone extends Zone {
        constructor(a, b, c) {
            var x, y, z;
            super();
            if (Util.isUndefined(a, b, c)) {
                x = y = z = 0;
            } else {
                x = a;
                y = b;
                z = c;
            }
    
            this.x = x;
            this.y = y;
            this.z = z;
        }
        getPosition() {
            this.vector.x = this.x;
            this.vector.y = this.y;
            this.vector.z = this.z;
            return this.vector;
        }
    
        crossing(particle) {
            if (this.log) {
                console.error('Sorry PointZone does not support crossing method');
                this.log = false;
            }
        }   
    }

    /**
     * BoxZone is a box zone
     * @param {Number|Proton.Vector3D} x - the position's x value or a Proton.Vector3D Object
     * @param {Number} y - the position's y value 
     * @param {Number} z - the position's z value 
     * @param {Number} w - the Box's width 
     * @param {Number} h - the Box's height 
     * @param {Number} d - the Box's depth 
     * @example 
     * var boxZone = new BoxZone(0,0,0,50,50,50);
     * or
     * var boxZone = new BoxZone(new Proton.Proton.Vector3D(0,0,0), 50, 50, 50);
     * @extends {Proton.Zone}
     * @constructor
     */
    export class BoxZone extends Zone {
        constructor(a, b, c, d, e, f) {
            super();
            var x, y, z, w, h, d;
            if (Util.isUndefined(b, c, d, e, f)) {
                x = y = z = 0;
                w = h = d = (a || 100);
            } else if (Util.isUndefined(d, e, f)) {
                x = y = z = 0;
                w = a;
                h = b;
                d = c;
            } else {
                x = a;
                y = b;
                z = c;
                w = d;
                h = e;
                d = f;
            }
            this.x = x;
            this.y = y;
            this.z = z;
            this.width = w;
            this.height = h;
            this.depth = d;
            //
            this.friction = 0.85;
            this.max = 6;
        }
        getPosition() {
            this.vector.x = this.x + MathUtils.randomAToB(-.5, .5) * this.width;
            this.vector.y = this.y + MathUtils.randomAToB(-.5, .5) * this.height;
            this.vector.z = this.z + MathUtils.randomAToB(-.5, .5) * this.depth;
            return this.vector;
        }
    
        _dead(particle) {
            if (particle.p.x + particle.radius < this.x - this.width / 2)
                particle.dead = true;
            else if (particle.p.x - particle.radius > this.x + this.width / 2)
                particle.dead = true;
    
            if (particle.p.y + particle.radius < this.y - this.height / 2)
                particle.dead = true;
            else if (particle.p.y - particle.radius > this.y + this.height / 2)
                particle.dead = true;
    
            if (particle.p.z + particle.radius < this.z - this.depth / 2)
                particle.dead = true;
            else if (particle.p.z - particle.radius > this.z + this.depth / 2)
                particle.dead = true;
        }
    
        _bound(particle) {
            if (particle.p.x - particle.radius < this.x - this.width / 2) {
                particle.p.x = this.x - this.width / 2 + particle.radius;
                particle.v.x *= -this.friction;
                this._static(particle, "x");
            } else if (particle.p.x + particle.radius > this.x + this.width / 2) {
                particle.p.x = this.x + this.width / 2 - particle.radius;
                particle.v.x *= -this.friction;
                this._static(particle, "x");
            }
    
            if (particle.p.y - particle.radius < this.y - this.height / 2) {
                particle.p.y = this.y - this.height / 2 + particle.radius;
                particle.v.y *= -this.friction;
                this._static(particle, "y");
            } else if (particle.p.y + particle.radius > this.y + this.height / 2) {
                particle.p.y = this.y + this.height / 2 - particle.radius;
                particle.v.y *= -this.friction;
                this._static(particle, "y");
            }
    
            if (particle.p.z - particle.radius < this.z - this.depth / 2) {
                particle.p.z = this.z - this.depth / 2 + particle.radius;
                particle.v.z *= -this.friction;
                this._static(particle, "z");
            } else if (particle.p.z + particle.radius > this.z + this.depth / 2) {
                particle.p.z = this.z + this.depth / 2 - particle.radius;
                particle.v.z *= -this.friction;
                this._static(particle, "z");
            }
        }
    
        _static(particle, axis) {
            if (particle.v[axis] * particle.a[axis] > 0) return;
            if (Math.abs(particle.v[axis]) < Math.abs(particle.a[axis]) * 0.0167 * this.max) {
                particle.v[axis] = 0;
                particle.a[axis] = 0;
            }
        }
    
        _cross(particle) {
            if (particle.p.x + particle.radius < this.x - this.width / 2 && particle.v.x <= 0)
                particle.p.x = this.x + this.width / 2 + particle.radius;
            else if (particle.p.x - particle.radius > this.x + this.width / 2 && particle.v.x >= 0)
                particle.p.x = this.x - this.width / 2 - particle.radius;
    
            if (particle.p.y + particle.radius < this.y - this.height / 2 && particle.v.y <= 0)
                particle.p.y = this.y + this.height / 2 + particle.radius;
            else if (particle.p.y - particle.radius > this.y + this.height / 2 && particle.v.y >= 0)
                particle.p.y = this.y - this.height / 2 - particle.radius;
    
            if (particle.p.z + particle.radius < this.z - this.depth / 2 && particle.v.z <= 0)
                particle.p.z = this.z + this.depth / 2 + particle.radius;
            else if (particle.p.z - particle.radius > this.z + this.depth / 2 && particle.v.z >= 0)
                particle.p.z = this.z - this.depth / 2 - particle.radius;
        }
    }

    /**
     * ScreenZone is a 3d line zone
     * @param {Number|Vector3D} x1 - the line's start point of x value or a Vector3D Object
     * @param {Number|Vector3D} y1 - the line's start point of y value or a Vector3D Object
     * @param {Number} z1 - the line's start point of z value 
     * @param {Number} x2 - the line's end point of x value 
     * @param {Number} y2 - the line's end point of y value 
     * @param {Number} z2 - the line's end point of z value 
     * @example 
     * var lineZone = new ScreenZone(0,0,0,100,100,0);
     * or
     * var lineZone = new ScreenZone(new Proton.Vector3D(0,0,0),new Proton.Vector3D(100,100,0));
     * @extends {Zone}
     * @constructor
     */
    export class ScreenZone extends Zone {
        constructor(camera, renderer, dis, dir) {
            super();

            this.camera = camera;
            this.renderer = renderer;
            this.dis = dis || 20;
            dir = dir || "1234";
            for (var i = 1; i < 5; i++)
                this["d" + i] = dir.indexOf(i + "") >= 0;
    
            this.name = "ScreenZone";
        }
        getPosition = function() {
            var vec2 = new Proton.Vector3D,
                canvas;
    
            return function() {
                canvas = this.renderer.domElement;
                vec2.x = Math.random() * canvas.width;
                vec2.y = Math.random() * canvas.height;
                this.vector.copy(THREEUtil.toSpacePos(vec2, this.camera, canvas));
                return this.vector;
            }
        }();
    
        _dead(particle) {
            var pos = THREEUtil.toScreenPos(particle.p, this.camera, this.renderer.domElement);
            var canvas = this.renderer.domElement;
    
            if ((pos.y + particle.radius < -this.dis) && this.d1) {
                particle.dead = true;
            } else if ((pos.y - particle.radius > canvas.height + this.dis) && this.d3) {
                particle.dead = true;
            }
    
            if ((pos.x + particle.radius < -this.dis) && this.d4) {
                particle.dead = true;
            } else if ((pos.x - particle.radius > canvas.width + this.dis) && this.d2) {
                particle.dead = true;
            }
        }
    
        _cross = function() {
            var vec2 = new Proton.Vector3D;
            return function(particle) {
                var pos = THREEUtil.toScreenPos(particle.p, this.camera, this.renderer.domElement);
                var canvas = this.renderer.domElement;
    
                if (pos.y + particle.radius < -this.dis) {
                    vec2.x = pos.x;
                    vec2.y = canvas.height + this.dis + particle.radius;
                    particle.p.y = THREEUtil.toSpacePos(vec2, this.camera, canvas).y;
                } else if (pos.y - particle.radius > canvas.height + this.dis) {
                    vec2.x = pos.x;
                    vec2.y = -this.dis - particle.radius;
                    particle.p.y = THREEUtil.toSpacePos(vec2, this.camera, canvas).y;
                }
    
                if (pos.x + particle.radius < -this.dis) {
                    vec2.y = pos.y;
                    vec2.x = canvas.width + this.dis + particle.radius;
                    particle.p.x = THREEUtil.toSpacePos(vec2, this.camera, canvas).x;
                } else if (pos.x - particle.radius > canvas.width + this.dis) {
                    vec2.y = pos.y;
                    vec2.x = -this.dis - particle.radius;
                    particle.p.x = THREEUtil.toSpacePos(vec2, this.camera, canvas).x;
                }
            }
        }();
    
        _bound(particle) {
            var pos = THREEUtil.toScreenPos(particle.p, this.camera, this.renderer.domElement);
            var canvas = this.renderer.domElement;
    
            if (pos.y + particle.radius < -this.dis) {
                particle.v.y *= -1;
            } else if (pos.y - particle.radius > canvas.height + this.dis) {
                particle.v.y *= -1;
            }
    
            if (pos.x + particle.radius < -this.dis) {
                particle.v.y *= -1;
            } else if (pos.x - particle.radius > canvas.width + this.dis) {
                particle.v.y *= -1;
            }
        }
    }

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

