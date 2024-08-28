import { Application, Assets, Sprite, Texture } from 'pixi.js';
import * as PIXI from 'pixi.js'
export class Game {
    private application: Application;
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.application = new PIXI.Application({
            width,
            height,
            backgroundColor: '#fff',
            forceCanvas: true, // 在高版本的 pixi.js 中使用 forceCanvas 需要引入 pixi.js-legacy
            // NOTE 建议传入 canvas 实例 避免在 react 更新的时候重复创建
            view: canvas,
        })        
    }
    async start() {
        const { application } = this;
        // load the texture we need
        const path = 'https://mdn.alipayobjects.com/huamei_cwajh0/afts/img/A*-1OBQqkRftkAAAAAAAAAAAAADn19AQ/original';
        const suffix = '.png';
        const textureUrl = path + suffix;

        await Assets.load<Texture>(textureUrl);        
        const bunny = new Sprite(Assets.get(textureUrl));

        // Setup the position of the bunny
        bunny.x = application.renderer.width / 2;
        bunny.y = application.renderer.height / 2;

        // Rotate around the center
        bunny.anchor.set(0.5, 0.5);
        bunny.interactive = true;
        bunny.onclick = () => {
            console.log('bunny click')
        }
        bunny.eventMode = 'passive';

        // Add the bunny to the scene we are building
        application.stage.addChild(bunny as any);

        // Listen for frame updates
        let elapsed = 0;
        application.ticker.add((delta) => {
            elapsed += delta;
            // each frame we spin the bunny around a bit
            bunny.transform.position.y = application.renderer.height / 2 + Math.sin(elapsed / 5) * 32;
        });
    }

    destroy() {
        this.application.destroy();
    }
}