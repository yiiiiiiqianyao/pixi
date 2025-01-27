// @ts-nocheck
import * as THREE from "three";
import { Util } from "./util.js";
import { Span, createSpan, createArraySpan } from "./span.js";
import { MathUtils } from "./mathUtils.js";
import { PUID } from "./puid.js";
import { ColorUtil } from "./colorUtil.js";
import { THREEUtil } from "./THREEUtil.js";
import { Pool } from "./pool.js";
import { Polar3D } from "./Polar3D.js";
import { Vector3D } from "./Vector3D.js";
import { PI, DR, EULER, MEASURE } from "./constant";
import { Integration } from "./Integration.js";
import { ease } from "./ease.js";
import { Behaviour } from "./Behaviour/Behaviour.js";

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
    this.integrationType = Util.initValue(integrationType, EULER);

    this.emitters = [];
    this.renderers = [];

    this.pool = new Pool();
    Proton.integrator = new Integration(this.integrationType);
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
    var i,
      length = this.emitters.length;
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

Proton.RK2 = "runge-kutta2";
Proton.RK4 = "runge-kutta4";
Proton.VERLET = "verlet";

Proton.PARTICLE_CREATED = "partilcleCreated";
Proton.PARTICLE_UPDATE = "partilcleUpdate";
Proton.PARTICLE_SLEEP = "particleSleep";
Proton.PARTICLE_DEAD = "partilcleDead";
Proton.PROTON_UPDATE = "protonUpdate";
Proton.PROTON_UPDATE_AFTER = "protonUpdateAfter";
Proton.EMITTER_ADDED = "emitterAdded";
Proton.EMITTER_REMOVED = "emitterRemoved";

Proton.bindEmtterEvent = false;

// EventDispatcher
function EventDispatcher() {
  this.initialize();
}

EventDispatcher.initialize = function (target) {
  target.addEventListener = p.addEventListener;
  target.removeEventListener = p.removeEventListener;
  target.removeAllEventListeners = p.removeAllEventListeners;
  target.hasEventListener = p.hasEventListener;
  target.dispatchEvent = p.dispatchEvent;
};

var p = EventDispatcher.prototype;

p._listeners = null;

p.initialize = function () {};
p.addEventListener = function (type, listener) {
  if (!this._listeners) {
    this._listeners = {};
  } else {
    this.removeEventListener(type, listener);
  }

  if (!this._listeners[type]) this._listeners[type] = [];
  this._listeners[type].push(listener);

  return listener;
};

p.removeEventListener = function (type, listener) {
  if (!this._listeners) return;
  if (!this._listeners[type]) return;

  var arr = this._listeners[type];
  for (var i = 0, l = arr.length; i < l; i++) {
    if (arr[i] === listener) {
      if (l === 1) {
        delete this._listeners[type];
      }
      // allows for faster checks.
      else {
        arr.splice(i, 1);
      }
      break;
    }
  }
};

p.removeAllEventListeners = function (type) {
  if (!type) this._listeners = null;
  else if (this._listeners) delete this._listeners[type];
};

p.dispatchEvent = function (eventName, eventTarget) {
  var ret = false,
    listeners = this._listeners;

  if (eventName && listeners) {
    var arr = listeners[eventName];
    if (!arr) return ret;

    arr = arr.slice();
    // to avoid issues with items being removed or added during the dispatch

    var handler,
      i = arr.length;
    while (i--) {
      var handler = arr[i];
      ret = ret || handler(eventTarget);
    }
  }

  return !!ret;
};

p.hasEventListener = function (type) {
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
  this.id = "particle_" + Particle.ID++;
  this.name = "Particle";
  this.reset("init");
  Util.setPrototypeByObj(this, pOBJ);
}

Particle.prototype = {
  getDirection: function () {
    return Math.atan2(this.v.x, -this.v.y) * (180 / PI);
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
   * @property {Vector3D}  p               - The particle's position
   * @property {Vector3D}  v               - The particle's velocity
   * @property {Vector3D}  a               - The particle's acceleration
   * @property {Array}  behaviours               - The particle's behaviours array
   * @property {Object}  transform               - The particle's transform collection
   */
  reset: function (init) {
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

    this.easing = ease.setEasingByName(ease.easeLinear);

    if (init) {
      this.p = new Vector3D();
      this.v = new Vector3D();
      this.a = new Vector3D();
      this.old = {};
      this.old.p = this.p.clone();
      this.old.v = this.v.clone();
      this.old.a = this.a.clone();

      this.behaviours = [];
      this.transform = {};
      this.color = { r: 0, g: 0, b: 0 };
      this.rotation = new Vector3D();
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

  update: function (time, index) {
    if (!this.sleep) {
      this.age += time;

      var i = this.behaviours.length;
      while (i--) {
        this.behaviours[i] &&
          this.behaviours[i].applyBehaviour(this, time, index);
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

  addBehaviour: function (behaviour) {
    this.behaviours.push(behaviour);
    behaviour.initialize(this);
  },

  addBehaviours: function (behaviours) {
    var i = behaviours.length;
    while (i--) {
      this.addBehaviour(behaviours[i]);
    }
  },

  removeBehaviour: function (behaviour) {
    var index = this.behaviours.indexOf(behaviour);
    if (index > -1) {
      this.behaviours.splice(index, 1);
    }
  },

  removeAllBehaviours: function () {
    Util.destroyArray(this.behaviours);
  },

  /**
   * Destory this particle
   * @method destroy
   */
  destroy: function () {
    this.removeAllBehaviours();
    this.energy = 0;
    this.dead = true;
    this.parent = null;
  },
};

Proton.Particle = Particle;

Proton.Behaviour = Behaviour;

/**
 * The number of particles per second emission (a [particle]/b [s]);
 * @class Proton.Rate
 * @constructor
 * @param {Array or Number or Span} numPan the number of each emission;
 * @param {Array or Number or Span} timePan the time of each emission;
 * for example: new Proton.Rate(new Span(10, 20), new Span(.1, .25));
 */

function Rate(numPan, timePan) {
  this.numPan = createSpan(Util.initValue(numPan, 1));
  this.timePan = createSpan(Util.initValue(timePan, 1));

  this.startTime = 0;
  this.nextTime = 0;
  this.init();
}

Rate.prototype = {
  init: function () {
    this.startTime = 0;
    this.nextTime = this.timePan.getValue();
  },

  getValue: function (time) {
    this.startTime += time;

    if (this.startTime >= this.nextTime) {
      this.init();

      if (this.numPan.b === 1) {
        if (this.numPan.getValue("Float") > 0.5) return 1;
        else return 0;
      } else {
        return this.numPan.getValue("Int");
      }
    }

    return 0;
  },
};

Proton.Rate = Rate;

function Initialize() {
  this.name = "Initialize";
}

Initialize.prototype.reset = function () {};

Initialize.prototype.init = function (emitter, particle) {
  if (particle) {
    this.initialize(particle);
  } else {
    this.initialize(emitter);
  }
};

///sub class init
Initialize.prototype.initialize = function (target) {};
Proton.Initialize = Initialize;

var InitializeUtil = {
  initialize(emitter, particle, initializes) {
    var i = initializes.length;
    while (i--) {
      var initialize = initializes[i];
      if (initialize instanceof Proton.Initialize)
        initialize.init(emitter, particle);
      else InitializeUtil.init(emitter, particle, initialize);
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
  },
};

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
  this.lifePan = createSpan(a, b, c);
}

Util.inherits(Life, Initialize);
Life.prototype.initialize = function (target) {
  if (this.lifePan.a === Infinity || this.lifePan.a === "infi")
    target.life = Infinity;
  else target.life = this.lifePan.getValue();
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
Position.prototype.reset = function () {
  if (!this.zones) this.zones = [];
  else this.zones.length = 0;

  var args = Array.prototype.slice.call(arguments);
  this.zones = this.zones.concat(args);
};

Position.prototype.addZone = function () {
  var args = Array.prototype.slice.call(arguments);
  this.zones = this.zones.concat(args);
};

Position.prototype.initialize = (function () {
  var zone;
  return function (target) {
    var zone = this.zones[(Math.random() * this.zones.length) >> 0];
    zone.getPosition();

    target.p.x = zone.vector.x;
    target.p.y = zone.vector.y;
    target.p.z = zone.vector.z;
  };
})();

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
  this.dirVec = new Vector3D(0, 0, 0);

  this.name = "Velocity";
}

Util.inherits(Velocity, Proton.Initialize);

Velocity.prototype.reset = function (a, b, c) {
  //[vector,tha]
  if (a instanceof Vector3D) {
    this.radiusPan = createSpan(1);
    this.dir = a.clone();
    this.tha = b * DR;
    this._useV = true;
  }

  //[polar,tha]
  else if (a instanceof Polar3D) {
    this.tha = b * DR;
    this.dirVec = a.toVector3D();
    this._useV = false;
  }

  //[radius,vector,tha]
  else {
    this.radiusPan = createSpan(a);
    this.dir = b.clone().normalize();
    this.tha = c * DR;
    this._useV = true;
  }
};

Velocity.prototype.normalize = function (vr) {
  return vr * MEASURE;
};

Velocity.prototype.initialize = (function () {
  var tha;
  var normal = new Vector3D(0, 0, 1);
  var v = new Vector3D(0, 0, 0);

  return function initialize(target) {
    tha = this.tha * Math.random();
    this._useV && this.dirVec.copy(this.dir).scalar(this.radiusPan.getValue());

    MathUtils.getNormal(this.dirVec, normal);
    v.copy(this.dirVec).applyAxisAngle(normal, tha);
    v.applyAxisAngle(this.dirVec.normalize(), Math.random() * PI * 2);

    // use  axisRotate methods
    // MathUtils.axisRotate(this.v1, this.dirVec, normal, tha);
    // MathUtils.axisRotate(this.v2, this.v1, this.dirVec.normalize(), Math.random() * PI * 2);
    target.v.copy(v);
    return this;
  };
})();

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
  this.massPan = createSpan(a, b, c);
}

Util.inherits(Mass, Proton.Initialize);
Mass.prototype.initialize = function (target) {
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
  this.radius = createSpan(a, b, c);
}

Util.inherits(Radius, Proton.Initialize);
Radius.prototype.reset = function (a, b, c) {
  this.radius = createSpan(a, b, c);
};

Radius.prototype.initialize = function (particle) {
  particle.radius = this.radius.getValue();
  particle.transform.oldRadius = particle.radius;
};

Proton.Radius = Radius;

function Body(body, w, h) {
  Body._super_.call(this);
  this.body = createArraySpan(body);
  this.w = w;
  this.h = Util.initValue(h, this.w);
}
Util.inherits(Body, Proton.Initialize);

Body.prototype.initialize = function (particle) {
  var body = this.body.getValue();
  if (!!this.w) {
    particle.body = {
      width: this.w,
      height: this.h,
      body: body,
    };
  } else {
    particle.body = body;
  }
};

Proton.Body = Body;


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
  this.damping = 0.006;
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
  this.rate = new Proton.Rate(1, 0.1);
  Emitter._super_.call(this, pObj);
  /**
   * The emitter's id;
   * @property id
   * @type {String} id
   */
  this.id = "emitter_" + Emitter.ID++;
  this.cID = 0;
  this.name = "Emitter";
}
Emitter.ID = 0;

Util.inherits(Emitter, Proton.Particle);
Proton.EventDispatcher.initialize(Emitter.prototype);

/**
 * start emit particle
 * @method emit
 * @param {Number} totalEmitTimes total emit times;
 * @param {String} life the life of this emitter
 */
Emitter.prototype.emit = function (totalEmitTimes, life) {
  this.currentEmitTime = 0;
  this.totalEmitTimes = Util.initValue(totalEmitTimes, Infinity);

  if (life === true || life === "life" || life === "destroy") {
    this.life = totalEmitTimes === "once" ? 1 : this.totalEmitTimes;
  } else if (!isNaN(life)) {
    this.life = life;
  }

  this.rate.init();
};

/**
 * stop emiting
 * @method stopEmit
 */
Emitter.prototype.stopEmit = function () {
  this.totalEmitTimes = -1;
  this.currentEmitTime = 0;
};

/**
 * remove current all particles
 * @method removeAllParticles
 */
Emitter.prototype.removeAllParticles = function () {
  var i = this.particles.length;
  while (i--) this.particles[i].dead = true;
};

/**
 * create single particle;
 *
 * can use emit({x:10},new Gravity(10),{'particleUpdate',fun}) or emit([{x:10},new Initialize],new Gravity(10),{'particleUpdate',fun})
 * @method removeAllParticles
 */
Emitter.prototype.createParticle = function (initialize, behaviour) {
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
Emitter.prototype.addSelfInitialize = function (pObj) {
  if (pObj["init"]) {
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
Emitter.prototype.addInitialize = function () {
  var i = arguments.length;
  while (i--) this.initializes.push(arguments[i]);
};

/**
 * remove the Initialize
 * @method removeInitialize
 * @param {Initialize} initialize a initialize
 */
Emitter.prototype.removeInitialize = function (initializer) {
  var index = this.initializes.indexOf(initializer);
  if (index > -1) this.initializes.splice(index, 1);
};

/**
 * remove all Initializes
 * @method removeInitializers
 */
Emitter.prototype.removeInitializers = function () {
  Util.destroyArray(this.initializes);
};
/**
 * add the Behaviour to particles;
 *
 * you can use Behaviours array:emitter.addBehaviour(Behaviour1,Behaviour2,Behaviour3);
 * @method addBehaviour
 * @param {Behaviour} behaviour like this new Color('random')
 */
Emitter.prototype.addBehaviour = function () {
  var i = arguments.length;
  while (i--) this.behaviours.push(arguments[i]);
};
/**
 * remove the Behaviour
 * @method removeBehaviour
 * @param {Behaviour} behaviour a behaviour
 */
Emitter.prototype.removeBehaviour = function (behaviour) {
  var index = this.behaviours.indexOf(behaviour);
  if (index > -1) this.behaviours.splice(index, 1);
};
/**
 * remove all behaviours
 * @method removeAllBehaviours
 */
Emitter.prototype.removeAllBehaviours = function () {
  Util.destroyArray(this.behaviours);
};

Emitter.prototype.integrate = function (time) {
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

Emitter.prototype.emitting = function (time) {
  if (this.totalEmitTimes === "once") {
    var i = this.rate.getValue(99999);
    if (i > 0) this.cID = i;
    while (i--) this.createParticle();
    this.totalEmitTimes = "none";
  } else if (!isNaN(this.totalEmitTimes)) {
    this.currentEmitTime += time;
    if (this.currentEmitTime < this.totalEmitTimes) {
      var i = this.rate.getValue(time);
      if (i > 0) this.cID = i;
      while (i--) this.createParticle();
    }
  }
};

Emitter.prototype.update = function (time) {
  this.age += time;
  if (this.dead || this.age >= this.life) {
    this.destroy();
  }

  this.emitting(time);
  this.integrate(time);

  var particle,
    i = this.particles.length;
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

Emitter.prototype.setupParticle = function (particle, initialize, behaviour) {
  var initializes = this.initializes;
  var behaviours = this.behaviours;

  if (initialize) {
    if (Util.isArray(initialize)) initializes = initialize;
    else initializes = [initialize];
  }

  if (behaviour) {
    if (Util.isArray(behaviour)) behaviours = behaviour;
    else behaviours = [behaviour];
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
Emitter.prototype.destroy = function () {
  this.dead = true;
  this.energy = 0;
  this.totalEmitTimes = -1;

  if (this.particles.length === 0) {
    this.removeInitializers();
    this.removeAllBehaviours();

    this.parent && this.parent.removeEmitter(this);
  }
};

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
}

Util.inherits(BehaviourEmitter, Proton.Emitter);
/**
 * add the Behaviour to emitter;
 *
 * you can use Behaviours array:emitter.addSelfBehaviour(Behaviour1,Behaviour2,Behaviour3);
 * @method addSelfBehaviour
 * @param {Proton.Behaviour} behaviour like this new Color('random')
 */
BehaviourEmitter.prototype.addSelfBehaviour = function () {
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
BehaviourEmitter.prototype.removeSelfBehaviour = function (behaviour) {
  var index = this.selfBehaviours.indexOf(behaviour);
  if (index > -1) this.selfBehaviours.splice(index, 1);
};

BehaviourEmitter.prototype.update = function (time) {
  BehaviourEmitter._super_.prototype.update.call(this, time);

  if (!this.sleep) {
    var length = this.selfBehaviours.length,
      i;
    for (i = 0; i < length; i++) {
      this.selfBehaviours[i].applyBehaviour(this, time, i);
    }
  }
};

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
  this.ease = Util.initValue(ease, 0.7);
  this._allowEmitting = false;
  this.mouse = new Vector3D();
  this.initEventHandler();

  FollowEmitter._super_.call(this, pObj);
}

Util.inherits(FollowEmitter, Proton.Emitter);
FollowEmitter.prototype.initEventHandler = function () {
  var self = this;
  this.mousemoveHandler = function (e) {
    self.mousemove.call(self, e);
  };

  this.mousedownHandler = function (e) {
    self.mousedown.call(self, e);
  };

  this.mouseupHandler = function (e) {
    self.mouseup.call(self, e);
  };

  this.mouseTarget.addEventListener("mousemove", this.mousemoveHandler, false);
};

/**
 * start emit particle
 * @method emit
 */
FollowEmitter.prototype.emit = function () {
  this._allowEmitting = true;
};

/**
 * stop emiting
 * @method stopEmit
 */
FollowEmitter.prototype.stopEmit = function () {
  this._allowEmitting = false;
};

FollowEmitter.prototype.setCameraAndCanvas = function (camera, canvas) {
  this.camera = camera;
  this.canvas = canvas;
};

FollowEmitter.prototype.setCameraAndRenderer = function (camera, renderer) {
  this.camera = camera;
  this.renderer = renderer;
  this.canvas = renderer.domElement;
};

FollowEmitter.prototype.mousemove = function (e) {
  var rect = this.canvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  var ratio = this.renderer ? this.renderer.getPixelRatio() : 1;
  x *= ratio;
  y *= ratio;

  this.mouse.x += (x - this.mouse.x) * this.ease;
  this.mouse.y += (y - this.mouse.y) * this.ease;

  this.p.copy(
    THREEUtil.toSpacePos(this.mouse, this.camera, this.canvas, this.renderer)
  );

  if (this._allowEmitting) {
    FollowEmitter._super_.prototype.emit.call(this, "once");
  }
};

/**
 * Destory this Emitter
 * @method destroy
 */
FollowEmitter.prototype.destroy = function () {
  FollowEmitter._super_.prototype.destroy.call(this);
  this.mouseTarget.removeEventListener(
    "mousemove",
    this.mousemoveHandler,
    false
  );
};

Proton.FollowEmitter = FollowEmitter;
