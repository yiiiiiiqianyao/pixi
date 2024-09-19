
import { Application, Assets, Sprite, Texture } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { Spine } from 'pixi-spine';
import { isWebGLSupported } from '../../utils/isWebGLSupported';
export class Game {
    private application: Application;
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        const isSupported = isWebGLSupported();
        console.log('is webgl supported', isSupported);
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
        bunny.onpointerdown = () => {
            console.log('bunny click')
        }
        application.stage.addChild(bunny as any);

        // 目前使用 pixi-spine 4.x 版本，只支持加载 3.x 版本的 spine 文件
         const spineUrl = 'https://mdn.alipayobjects.com/huamei_cwajh0/uri/file/as/2/cwajh0/4/mp/qvHq0Xj3g6XSXASd/spineboy/spineboy.json';
        const { spineData } = await Assets.load(spineUrl);
        const spineBoy = new Spine(spineData);
        spineBoy.state.setAnimation(0, 'walk', true);
        spineBoy.x = application.renderer.width / 2;
        spineBoy.y = application.renderer.height;
        application.stage.addChild(spineBoy as PIXI.DisplayObject);
         
        let elapsed = 0;
        application.ticker.add((delta) => {
            elapsed += delta;
            bunny.transform.position.y = application.renderer.height / 2 + Math.sin(elapsed / 5) * 32;
        });
    }

    destroy() {
        this.application.destroy(true);
    }
}