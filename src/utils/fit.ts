import { Application, Texture } from "pixi.js";

export enum FitDir {
    Horizontal = 'Horizontal',
    Vertical = 'Vertical',
}

// 根据 application 对 texture 的大小进行适配 一般对背景图中进行使用
export function fitTexture(application: Application, texture: Texture, dir: FitDir = FitDir.Vertical) {
    const { width: RendererWidth, height: RendererHeight } = application.renderer;
    const { width: TextureWidth, height: TextureHeight } = texture;
    if(dir === FitDir.Horizontal) {
       // 设置水平裁切
       const height = RendererHeight;
       const width = (RendererHeight / TextureHeight) * TextureWidth;
       return { height, width };
    } else {
        // 设置垂直裁切
        const width = RendererWidth;
        const height = (RendererWidth / TextureWidth) * TextureHeight;
        return { height, width };
    }
}