## init 

```js
const app = new PIXI.Application({ resizeTo: window });
document.body.appendChild(app.view);
```

### sharedTicker 同步 ticker
- `sharedTicker` 是一个全局的 `Ticker` 实例，可以被多个对象共享来同步它们的更新。
- `sharedTicker` 默认为 `false`。
```js
const app = new PIXI.Application({ 
    sharedTicker: true
});
import { Container, Ticker } from 'pixi.js';

class MyAnimatedSprite extends PIXI.Sprite {
    constructor(texture) {
        super(texture);
        
        // 将此精灵的ticker设置为共享的ticker
        this.ticker = Ticker.shared;
        
        // 添加更新逻辑
        this.ticker.add(delta => {
            // 更新动画或其他逻辑
        });
    }
}
// 创建并添加到舞台
let mySprite = new MyAnimatedSprite(someTexture);
app.stage.addChild(mySprite);
```
性能考量：虽然共享Ticker可以简化代码并保持时间同步，但如果所有对象都直接依赖于sharedTicker，在复杂项目中可能会导致性能瓶颈。

```js
let tickerUpdateCallback = (deltaTime) => {
    // 更新逻辑
};
Ticker.shared.add(tickerUpdateCallback);
// ...之后不再需要时
Ticker.shared.remove(tickerUpdateCallback);
```

### setup loop

```js
// Setup rendering loop
PIXI.Ticker.shared.add(() => renderer.render(stage));
```

## destroy
```js
// 销毁应用
app.destroy();

// 连同 canvas 元素一起销毁
app.destroy(true);
```