/**
 * 事件总线
 */
export class EventSystem {
  /**
   * 订阅事件
   */
  private static events: Record<string, Function[]> = {};

  /**
   * 订阅事件
   * @param systemName 模块名
   * @param name 订阅名
   * @param cb 订阅回调
   */
  static subscribe(name: string, cb: Function) {
    if (!this.events[name]) {
      this.events[name] = [];
    }

    this.events[name].push(cb);
  }

  /**
   * 取消订阅, 无需传入回调函数
   * @param systemName 模块名
   * @param name 事件名
   */
  static unsubscribe(name: string, cb?: Function) {
    if (!this.events[name]) {
      this.events[name] = [];
    }

    if (cb) {
      this.events[name] = this.events[name].filter(
        (callback) => callback !== cb,
      );
    } else {
      this.events[name] = [];
    }
  }

  /**
   * 广播事件
   * @param name 事件名
   * @param params 需要广播的参数
   */
  static broadcast(name: string, params?: any) {
    if (!this.events[name]) return;

    this.events[name].forEach((cb) => cb(params));
  }

  /**
   * 订阅一次
   * @param name 事件名
   * @param cb 回调函数
   */
  static once(name: string, cb: Function) {
    const wrapper = (...args: any[]) => {
      cb(...args);
      this.unsubscribe(name, wrapper);
    };
    this.subscribe(name, wrapper);
  }

  private _events: any;
  constructor() {
    this._events = {};
  }
  on(event: string, cb: Function) {
    if (!this._events || !this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(cb);
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (!this._events[event]) {
      return;
    }
    this._events[event].forEach((cb: Function) => {
      cb(...args);
    });
    return this;
  }

  off(event: string, cb?: Function) {
    if (!cb) {
      // clear all event cb
      this._events[event] = [];
      return;
    }
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(
        (item: Function) => item !== cb,
      );
    }
    return this;
  }

  once(event: string, cb: Function) {
    const fn = (...args: any[]) => {
      cb(...args);
      this.off(event, fn);
    };
    this.on(event, fn);
    return this;
  }
}
