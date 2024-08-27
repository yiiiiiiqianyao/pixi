# @pixi/core Renderer
The core of the PixiJS system is the renderer, which displays the scene graph and draws it to the screen. The default renderer for PixiJS is based on WebGL under the hood.

# @pixi/display Container
Main display object which creates a scene graph: the tree of renderable objects to be displayed, such as sprites, graphics and text. 

 Container can set Mask & Filtering(webgl only)
 1. Mask
 ```js
    let mask = new PIXI.Graphics();
    // Add the rectangular area to show
    mask.beginFill(0xffffff);
    mask.drawRect(0,0,200,200);
    mask.endFill();

    // Add container that will hold our masked content
    let maskContainer = new PIXI.Container();
    // Set the mask to use our graphics object from above
    maskContainer.mask = mask;
    // Add the mask as a child, so that the mask is positioned relative to its parent
    maskContainer.addChild(mask);
 ```
 2. Filter
 Default Filters in PixiJS
 - @pixi/filter-alpha
 - @pixi/filter-blur
 - @pixi/filter-color-matrix
 - @pixi/filter-displacement
 - @pixi/filter-fxaa
 - @pixi/filter-noise

# @pixi/loader Loader
The loader system provides tools for asynchronously loading resources such as images and audio files.

# @pixi/ticker Ticker
Tickers provide periodic callbacks based on a clock. Your game update logic will generally be run in response to a tick once per frame. You can have multiple tickers in use at one time.

# @pixi/app Application
The Application is a simple helper that wraps a Loader, Ticker and Renderer into a single, convenient easy-to-use object.

# @pixi/assets Assets
    1. load single
    - Textures (avif, webp, png, jpg, gif)
    - Sprite sheets (json)
    - Bitmap fonts (xml, fnt, txt)
    - Web fonts (ttf, woff, woff2)
    - Json files (json)
    - Text files (txt)
    2. load manifest
    - https://pixijs.com/7.x/guides/components/assets#loading-multiple-assets
    3. background load
    - PIXI.Assets.backgroundLoad(...) PIXI.Assets.backgroundLoadBundle(...)

# @pixi/interaction Interaction
PixiJS supports both touch and mouse-based interaction - making objects clickable, firing hover events, etc.

# @pixi/accessibility Accessibility
Woven through our display system is a rich set of tools for enabling keyboard and screen-reader accessibility.
