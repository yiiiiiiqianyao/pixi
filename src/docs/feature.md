## Target
1. 第一步是完善 pixi 构建轻互动项目的最佳实践模版
2. 第二步是沉淀 pixi 通用组件
3. 第三步是基于 pixi 封装一套简单的游戏系统

## Design
- 兼容 canvas 降级，使用 pixi.js-legacy 版本，功能开发的时候固定版本
- 页面单实例（标准）

## 待完成
- 初始化
- 帧同步设置 sync （ticker.minFPS/ticker.maxFPS）
- 帧率计算
- drawCall 统计
- EventEmitter 事件系统
- tween/popmotion 补间动画系统
使用 tween 实现（帧同步）
```js
export function tweenA2BNumber(
  a: number,
  b: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete = () => {},
  easing = easeInOut,
) {
  const { stop } = animate({
    from: a,
    to: b,
    duration,
    ease: easing,
    onUpdate,
    onComplete,
  });
  return stop;
}

// vec2 tween
export function tweenA2BVec2(
  a: IVec2,
  b: IVec2,
  duration: number,
  onUpdate: (value: IVec2) => void,
  onComplete = () => {},
  easing = easeInOut,
) {
  const { stop } = animate({
    from: a,
    to: b,
    duration,
    ease: easing,
    onUpdate,
    onComplete,
  });
  return stop;
}
```

- widget/viewport 窗口系统
    - 可以参考 pixi-viewport 插件 
    - github https://github.com/davidfig/pixi-viewport
    - demo online https://davidfig.github.io/pixi-viewport/
    - jsdoc https://davidfig.github.io/pixi-viewport/jsdoc/
- 音频模块
    - 可以使用 pixi sound 或者 howlerjs 插件
    - pixi sound https://github.com/pixijs/sound
    - howlerjs https://howlerjs.com/

- 游戏地图模块 TileMap

- culling 渲染的剔除（sprite.renderable = false;）

## 已完成

## demo 列表
- sprite 加载绘制
- text 文本加载绘制
- graphic 图形元素
- animateSprite 帧动画
- particle 粒子系统
- physic 物理模块
- interaction 动作交互
- spine/lottie 动画文件
