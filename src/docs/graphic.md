## The list of basic primitives
- Line
- Rect
- RoundRect
- Circle
- Ellipse
- Arc
- Bezier and Quadratic Curve


The Graphics Extras package (@pixi/graphics-extras) optionally includes the following complex primitives:
- Torus
- Chamfer Rect
- Fillet Rect
- Regular Polygon
- Star
- Rounded Polygon

## Inside every Graphics object is a GraphicsGeometry object.
You can re-use geometry from one Graphics object in another.
```js
// Create a master graphics object
let template = new PIXI.Graphics();
// Add a circle
template.drawCircle(100, 100, 50);

// Create 5 duplicate objects
for (let i = 0; i < 5; i++) {
  // Initialize the duplicate using our template's pre-built geometry
  let duplicate = new PIXI.Graphics(template.geometry);
}
```