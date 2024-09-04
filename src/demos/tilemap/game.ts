import { Application, Sprite } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { TexturePool } from '../../utils/TexturePool';
import { backgroundTextureUrl, numberTextureUrl } from './resource';
import { FitDir, fitTexture } from '../../utils/fit';
import { InfoApplication } from '../../game/utils';
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

        // pixi spritesheet & AnimatedSprite
        PIXI.Assets.load('http://183.129.161.21:5099/yqy/static/fighter.json')
        .then(() => {
            const frames = [];
            for (let i = 0; i < 30; i++) {
                const val = i < 10 ? `0${i}` : i;
                frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
            }

            const anim = new PIXI.AnimatedSprite(frames);
            anim.x = application.screen.width / 2;
            anim.y = application.screen.height / 2 - 200;
            anim.anchor.set(0.5);
            anim.animationSpeed = 0.5;
            anim.play();
            application.stage.addChild(anim as PIXI.DisplayObject);
        })

        const number = new Sprite(TexturePool.getTexture(numberTextureUrl));
        number.x = application.renderer.width / 2;
        number.y = application.renderer.height / 2;
        number.anchor.set(0.5, 0.5);
        number.interactive = true;
        number.onpointerdown = () => {
            console.log('bunny click')
        }

        application.stage.addChild(number as any);

        application.ticker.add(() => {
            number.rotation += 0.01;
        });
    }

    async loadTextureResource() {
        await TexturePool.loadTexture(backgroundTextureUrl, { suffix: '.png' });
        await TexturePool.loadTexture(numberTextureUrl, { suffix: '.png' });
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
        this.application.destroy();
    }
}