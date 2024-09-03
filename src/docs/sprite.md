## download sprite

```js
  // Magically load the PNG asynchronously
  let sprite = PIXI.Sprite.from('sample.png');
  app.stage.addChild(sprite);
```
## support suffix
- avif, webp, png, jpg, gif

## spritesheets

`spritesheet` 的 `json` 文件和要加载的 `image` 图片通常在同一目录下
- https://pixijs.com/assets/spritesheet/fighter.json
- https://pixijs.com/assets/spritesheet/fighter.png
- demo https://codesandbox.io/p/sandbox/happy-haze-2f4wh7?file=%2Fsrc%2Findex.js&utm_medium=sandpack
```js
// Create object to store sprite sheet data
const atlasData = {
    frames: {
        enemy1: {
            frame: { x: 0, y:0, w:32, h:32 },
            sourceSize: { w: 32, h: 32 },
            spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }
        },
        enemy2: {
            frame: { x: 32, y:0, w:32, h:32 },
            sourceSize: { w: 32, h: 32 },
            spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }
        },
    },
    meta: {
        image: 'images/spritesheet.png',
        format: 'RGBA8888',
        size: { w: 128, h: 32 },
        scale: 1
    },
    animations: {
        enemy: ['enemy1','enemy2'] //array of frames by name
    }
}


// Create the SpriteSheet from data and image
const spritesheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(atlasData.meta.image),
    atlasData
);

// Generate all the Textures asynchronously
await spritesheet.parse();

// spritesheet is ready to use!
const anim = new PIXI.AnimatedSprite(spritesheet.animations.enemy);

// set the animation speed
anim.animationSpeed = 0.1666;
// play the animation on a loop
anim.play();
// add it to the stage to render
app.stage.addChild(anim);
```