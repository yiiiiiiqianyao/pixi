## Target
1. 第一步是完善 pixi 构建轻互动项目的最佳实践模版
2. 第二步是沉淀 pixi 通用组件
3. 第三步是基于 pixi 封装一套简单的游戏系统

## Design
- 兼容 canvas 降级，使用 pixi.js-legacy 版本，功能开发的时候固定版本
- 页面单实例（标准）

## 待完成
- 初始化
- 帧同步计算
- 帧率计算
- drawCall 统计
- EventEmitter 事件系统
- tween/popmotion 补间动画系统
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
