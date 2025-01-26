import { Vector3D } from './Vector3D.js';
/**
     * Zone is a base class.
     * @constructor
     */
     export class Zone {
        constructor() {
            this.vector = new Vector3D(0, 0, 0);
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
