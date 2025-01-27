import { Emitter } from './Emitter.js';
/**
 * The FollowEmitter class inherits from Emitter
 *
 * use the FollowEmitter will emit particle when mousemoving
/**
 * The BehaviourEmitter class inherits from Proton.Emitter
 *
 * use the BehaviourEmitter you can add behaviours to self;
 * @class Proton.BehaviourEmitter
 * @constructor
 * @param {Object} pObj the parameters object;
 */
export class BehaviourEmitter extends Emitter {
    constructor(pObj) {
      super(pObj);
      this.selfBehaviours = [];
    }
    /**
   * add the Behaviour to emitter;
   *
   * you can use Behaviours array:emitter.addSelfBehaviour(Behaviour1,Behaviour2,Behaviour3);
   * @method addSelfBehaviour
   * @param {Behaviour} behaviour like this new Color('random')
   */
  addSelfBehaviour () {
    var length = arguments.length,
      i;
    for (i = 0; i < length; i++) {
      this.selfBehaviours.push(arguments[i]);
    }
  };
  /**
   * remove the Behaviour for self
   * @method removeSelfBehaviour
   * @param {Behaviour} behaviour a behaviour
   */
  removeSelfBehaviour (behaviour) {
    var index = this.selfBehaviours.indexOf(behaviour);
    if (index > -1) this.selfBehaviours.splice(index, 1);
  };
  
  update (time) {
    super.update.call(this, time);
  
    if (!this.sleep) {
      var length = this.selfBehaviours.length,
        i;
      for (i = 0; i < length; i++) {
        this.selfBehaviours[i].applyBehaviour(this, time, i);
      }
    }
  };
  }
