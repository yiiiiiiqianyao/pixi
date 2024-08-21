// 检查是否支持WebGL2
export function isWebGL2Supported() {
    try {
        const canvas = document.createElement('canvas');
        return !!window.WebGL2RenderingContext && (canvas.getContext('webgl2') || {}).constructor === WebGL2RenderingContext;
    } catch (e) {
        return false;
    }
}