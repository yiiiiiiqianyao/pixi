import { Application, RENDERER_TYPE } from "pixi.js";

// 检查是否支持WebGL2
export function isWebGL2Supported() {
    try {
        const canvas = document.createElement('canvas');
        return !!window.WebGL2RenderingContext && (canvas.getContext('webgl2') || {}).constructor === WebGL2RenderingContext;
    } catch (e) {
        return false;
    }
}

// TODO 后续待完善
export function InfoApplication(application: Application) {
    switch(application.renderer.type) {
        case RENDERER_TYPE.UNKNOWN:
            console.info('PIXI.RENDERER_TYPE.UNKNOWN');
            break;
        case RENDERER_TYPE.WEBGL:
            console.info('PIXI.RENDERER_TYPE.WEBGL');
            break;
        case RENDERER_TYPE.CANVAS:
            console.info('PIXI.RENDERER_TYPE.CANVAS');
            break;
    }
}