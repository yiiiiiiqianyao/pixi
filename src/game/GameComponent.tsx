import React, { useEffect, useRef } from "react";
import  './game.css';
import * as PIXI from 'pixi.js'
// import 'pixi.js-legacy';
import { Game } from "./game";

// // 检查是否支持WebGL2
// function isWebGL2Supported() {
//     try {
//         const canvas = document.createElement('canvas');
//         return !!window.WebGL2RenderingContext && (canvas.getContext('webgl2') || {}).constructor === WebGL2RenderingContext;
//     } catch (e) {
//         return false;
//     }
// }

const GameComponent = () => {
    const gameWrapRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => {
        const container = gameWrapRef.current!;
        console.log('pixi game component')
        const application = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: '#fff',
            // forceCanvas: true,
        })
        gameWrapRef.current!.appendChild(application.view as any);
        const game = new Game(application);
        game.start();
        return () => {
            application.destroy();
        }
    }, [])
    return <div ref={gameWrapRef} className='_game_wrap'>
    </div>
}
export default React.memo(GameComponent);