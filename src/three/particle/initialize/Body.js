import { Initialize } from './Initialize.js';
import { createArraySpan } from '../math/Span.js';
import { Util } from '../utils/Util.js';

export class Body extends Initialize {
    constructor(body, w, h) {
      super();
      this.body = createArraySpan(body);
      this.w = w;
      this.h = Util.initValue(h, this.w);
    }
    initialize = function (particle) {
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
  }
  
  