## animations
获取 `spine` 支持的动画
```js
loader.load((loader, resources) => {
    const spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
   const animations = spineAnimation.skeleton.data.animations;
});


```
`Spine` 动画可以在多个轨道上同时播放不同的动画。每个轨道可以独立控制一个动画的播放。
`pixi-spine` 中，`setAnimation` 方法的 `trackIndex` 参数用于指定播放动画的轨道索引。

```js
spineBoy.state.setAnimation(0, 'walk', true);   
```

## interactive
`spine` 若想支持交互，一般有两种方法。
1. 使用容器包裹并检测点击
```js
loader.load((loader, resources) => {
    const spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
    const container = new PIXI.Container();
    container.addChild(spineAnimation);
    app.stage.addChild(container);

    container.interactive = true;
    container.on('pointerdown', () => {
        console.log('Spine animation clicked!');
    });
});
```
2. 直接在 Spine 动画对象上尝试检测点击
```js
loader.load((loader, resources) => {
    const spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
    app.stage.addChild(spineAnimation);

    spineAnimation.interactive = true;
    spineAnimation.on('pointerdown', () => {
        console.log('Spine animation clicked!');
    });
});
```