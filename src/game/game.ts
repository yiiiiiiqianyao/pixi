import { Application, Assets, Sprite, Texture } from 'pixi.js';
export class Game {
    private application: Application;
    constructor(application: Application) {
        this.application = application;
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
        bunny.eventMode = 'passive';
        bunny.onclick = () => {
            console.log('bunny click')
        }

        // Add the bunny to the scene we are building
        application.stage.addChild(bunny as any);

        // Listen for frame updates
        application.ticker.add(() => {
            // each frame we spin the bunny around a bit
            bunny.rotation += 0.01;
        });
    }
}