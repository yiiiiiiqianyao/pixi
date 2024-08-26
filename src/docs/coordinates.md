## Coordinate Space
The origin of the global coordinate space used by PixiJS in the top left corner of the screen.

## Convert
Convert local coordinate to global coordinate.
```js
// Get the global position of an object, relative to the top-left of the screen
let globalPos = obj.toGlobal(new PIXI.Point(0,0));
```