import { Application, Sprite } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { Emitter } from '@pixi/particle-emitter'
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

        const worldWidth = application.renderer.width;
        const worldHeight = application.renderer.height;
        const container = new PIXI.Container();
        container.transform.position.set(worldWidth / 2, worldHeight/ 2);
        application.stage.addChild(container as PIXI.DisplayObject);

        // const sprite  = new PIXI.Sprite(TexturePool.getTexture(numberTextureUrl));
        // container.addChild(sprite as PIXI.DisplayObject);

        const numberTexture = TexturePool.getTexture(numberTextureUrl);
        const emitter = new Emitter(
            container,
            {
                lifetime: {
                    min: 0.5,
                    max: 0.5
                },
                frequency: 0.008,
                spawnChance: 1,
                particlesPerWave: 1,
                emitterLifetime: 0.31,
                maxParticles: 1000,
                pos: {
                    x: 0,
                    y: 0
                },
                addAtBack: false,
                behaviors: [
                    {
                        type: 'alpha',
                        config: {
                            alpha: {
                                list: [
                                    {
                                        time: 0,
                                        value: 0.9,
                                    },
                                    {   
                                        time: 1,
                                        // Note: 存在 bug，若是两个值相同 就会报错
                                        // value: 0.9,
                                        value: 0.3,
                                    }
                                ],
                            },
                        }
                    },
                    {
                        type: 'scale',
                        config: {
                            scale: {
                                list: [
                                    {
                                        value: 1,
                                        time: 0
                                    },
                                    {
                                        value: 0.3,
                                        time: 1
                                    }
                                ],
                            },
                        }
                    },
                    {
                        type: 'color',
                        config: {
                            color: {
                                list: [
                                    {
                                        value: "fb1010",
                                        time: 0
                                    },
                                    {
                                        value: "f5b830",
                                        time: 1
                                    }
                                ],
                            },
                        }
                    },
                    {
                        type: 'spawnShape',
                        config: {
                            type: 'torus',
                            data: {
                                x: 0,
                                y: 0,
                                radius: 100
                            }
                        }
                    },
                    {
                        type: 'textureSingle',
                        config: {
                            texture: numberTexture,
                        }
                    }                
                ],
            }
        );
        emitter.emit = true;
    
        application.ticker.add((delta) => {
            emitter.update((delta) * 0.005);
        });
        // Start emitting
        emitter.emit = true;

    }

    async loadTextureResource() {
        await TexturePool.loadTexture(backgroundTextureUrl, { suffix: '.png' });
        await TexturePool.loadTexture(numberTextureUrl);
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