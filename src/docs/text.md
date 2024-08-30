PIXI.js 的文本对象实质上就是 sprite 精灵，通过在离屏绘制文本纹理，然后在场景中绘制
## load font
PIXI.js 目前（7.x）需要自己额外加载字体文件

```js
@font-face {
  font-family: Short Stack;
  src: url(short-stack.woff2) format('woff2'),
       url(short-stack.woff) format('woff');
}
```

## PIXI.Text & PIXI.BitmapText
PIXI.BitmapText 和 PIXI.Text 是 PIXI.js 中用于渲染文本的两种不同方式：

###  PIXI.Text:
- 使用矢量文本渲染，是基于浏览器的文本渲染功能。
- 支持丰富的文本样式和排版，能够处理多种字体和样式（如粗体、斜体等）。
- 渲染性能相对较低，尤其是在需要频繁重绘或文本变化较多的情况下。

###  PIXI.BitmapText:
- 使用位图字体（Bitmap Font），即将字形预先渲染为纹理。
- 渲染速度更快，特别适合大量或多次渲染的场景（如游戏中的计分板、对话框等）。
- 性能更好，特别在场景中需要快速渲染的情况下，通常更能应对高帧率的需求。

## Demo

- PIXI.Text
```js
// 创建PIXI.Text
const text = new PIXI.Text('Hello, PIXI!', {
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 0xff1010, // 红色
    align: 'center'
});

// 设置文本位置
text.x = app.renderer.width / 2;
text.y = app.renderer.height / 2;
text.anchor.set(0.5); // 使文本居中

// 将文本添加到舞台
app.stage.addChild(text);
```

- PIXI.BitmapText
```js
// 载入位图字体文件
PIXI.Loader.shared.add('fonts/myFont.xml').load(setup);

function setup() {
    // 创建PIXI.BitmapText
    const bitmapText = new PIXI.BitmapText('Hello, BitmapText!', {
        font: 'myFont' // 从位图字体文件中加载的字体
    });

    // 设置位图文本位置
    bitmapText.x = app.renderer.width / 2;
    bitmapText.y = app.renderer.height / 2;
    bitmapText.anchor.set(0.5); // 使文本居中

    // 将位图文本添加到舞台
    app.stage.addChild(bitmapText);
}
```