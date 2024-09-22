
import { Application, Assets, Text } from 'pixi.js';
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
        const { width, height } = application.renderer;

        const introudceText = new Text('Please click SpineBoy to switch animate!', {
            wordWrap: true,
            wordWrapWidth: width * 0.8, // 设置合适的宽度，当文本超过这个宽度时自动换行
        });
        introudceText.x = width / 2;
        introudceText.y = 64;
        introudceText.anchor.set(0.5, 0);
        application.stage.addChild(introudceText as PIXI.DisplayObject);

        let currentSpineTrack = 0;
        // 目前使用 pixi-spine 4.x 版本，只支持加载 3.x 版本的 spine 文件
        const spineUrl = 'https://mdn.alipayobjects.com/huamei_cwajh0/uri/file/as/2/cwajh0/4/mp/qvHq0Xj3g6XSXASd/spineboy/spineboy.json';
        const { spineData } = await Assets.load(spineUrl);        
        const spineBoy = new Spine(spineData);
        const spineHeight = spineBoy.getBounds().height;
        const animations = spineBoy.skeleton.data.animations;
        spineBoy.state.setAnimation(currentSpineTrack, animations[currentSpineTrack].name, true);
        spineBoy.x = width / 2;
        spineBoy.y = height;

        const currentAnimateText = new Text(animations[0].name, {
            fontSize: 48,
            fontFamily: "Chalkduster",
        });
        currentAnimateText.x = width / 2;
        currentAnimateText.y = height - spineHeight - 32;
        currentAnimateText.anchor.set(0.5, 0.5);
        application.stage.addChild(currentAnimateText as PIXI.DisplayObject);

        spineBoy.interactive = true;
        spineBoy.on('pointerdown', () => {
            if(currentSpineTrack === 0) {
                currentSpineTrack = 1;      
            } else {
                currentSpineTrack = 0;        
            }
            const animate = animations[currentSpineTrack].name;
            currentAnimateText.text = animate;
            spineBoy.state.setAnimation(0, animate, true);          
        })

        application.stage.addChild(spineBoy as PIXI.DisplayObject);
    }

    destroy() {
        this.application.destroy(true);
    }
}