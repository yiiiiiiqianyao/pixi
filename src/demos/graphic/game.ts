import { Application, Sprite } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { TexturePool } from '../../utils/TexturePool';
import { FitDir, fitTexture } from '../../utils/fit';
import { InfoApplication } from '../../game/utils';
import { backgroundTextureUrl } from './resource';
export class Game {
    private application: Application;
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.application = new PIXI.Application({
            width,
            height,
            backgroundColor: '#fff',
            // forceCanvas: true, // 在高版本的 pixi.js 中使用 forceCanvas 需要引入 pixi.js-legacy
            // NOTE 建议传入 canvas 实例 避免在 react 更新的时候重复创建
            view: canvas,
        })
        InfoApplication(this.application);
    }
    async start() {
        const { application } = this;
        await this.loadTextureResource();
        this.initBackground();
        // TODO: pixi default graphics
    }

    async loadTextureResource() {
        await TexturePool.loadTexture(backgroundTextureUrl, { suffix: '.png' });
    }

    initBackground() {
        const { application } = this;
        const bgTexture = TexturePool.getTexture(backgroundTextureUrl);
        const bgSprite = new Sprite(bgTexture);
        // // 设置水平裁切 横屏常见
        // const { width, height } = fitTexture(application, bgTexture, FitDir.Horizontal);
        // 设置垂直裁切 竖屏常见
        const { width, height } = fitTexture(application, bgTexture, FitDir.Vertical);
        bgSprite.width = width;
        bgSprite.height = height;
        bgSprite.x = application.renderer.width / 2;
        bgSprite.y = application.renderer.height / 2;
        bgSprite.anchor.set(0.5, 0.5);
        application.stage.addChild(bgSprite as PIXI.DisplayObject);
    }

    destroy() {
        // Note: 在 测试项目中不需要移除 canvas， removeView 为 false
        this.application.destroy(false);
    }
}