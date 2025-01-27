import { Quaternion } from './Quaternion.js';
import { PI } from '../constant';

export class Vector3D {
        constructor(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        setX(x) {
            this.x = x;
            return this;
        }

        setY(y) {
            this.y = y;
            return this;
        }

        setZ(z) {
            this.z = z;
            return this;
        }

        getGradient() {
            if (this.x !== 0)
                return Math.atan2(this.y, this.x);
            else if (this.y > 0)
                return PI / 2;
            else if (this.y < 0)
                return -PI / 2;
        }

        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }

        add(v, w) {
            if (w !== undefined) return this.addVectors(v, w);

            this.x += v.x;
            this.y += v.y;
            this.z += v.z;

            return this;

        }

        addValue(a, b, c) {
            this.x += a;
            this.y += b;
            this.z += c;

            return this;

        }

        addVectors(a, b) {
            this.x = a.x + b.x;
            this.y = a.y + b.y;
            this.z = a.z + b.z;

            return this;
        }

        addScalar(s) {
            this.x += s;
            this.y += s;
            this.z += s;

            return this;
        }

        sub(v, w) {
            if (w !== undefined) return this.subVectors(v, w);

            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;

            return this;
        }

        subVectors(a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            return this;
        }

        scalar(s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;

            return this;
        }

        divideScalar(s) {
            if (s !== 0) {
                this.x /= s;
                this.y /= s;
                this.z /= s;
            } else {
                this.set(0, 0, 0);
            }

            return this;
        }

        negate() {
            return this.scalar(-1);
        }

        dot(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        }

        cross(v) {
            var x = this.x,
                y = this.y,
                z = this.z;

            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;

            return this;
        }

        lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }

        length() {
            return Math.sqrt(this.lengthSq());
        }

        normalize() {
            return this.divideScalar(this.length());
        }

        distanceTo(v) {
            return Math.sqrt(this.distanceToSquared(v));
        }

        crossVectors(a, b) {

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

        }

        eulerFromDir(dir) {}

        applyEuler = function() {
            var quaternion;

            return function applyEuler(euler) {
                if (quaternion === undefined) quaternion = new Quaternion();
                this.applyQuaternion(quaternion.setFromEuler(euler));
                return this;
            };
        }()

        applyAxisAngle =function() {
            var quaternion;
            return function applyAxisAngle(axis, angle) {
                if (quaternion === undefined) quaternion = new Quaternion();
                this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
                return this;
            };
        }()

        applyQuaternion(q) {
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
        }

        distanceToSquared(v) {
            var dx = this.x - v.x,
                dy = this.y - v.y,
                dz = this.z - v.z;

            return dx * dx + dy * dy + dz * dz;
        }

        lerp(v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        }

        equals(v) {
            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        }

        clear() {
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            return this;
        }

        clone() {
            return new Vector3D(this.x, this.y, this.z);
        }

        toString() {
            return "x:" + this.x + "y:" + this.y + "z:" + this.z;
        }
    }