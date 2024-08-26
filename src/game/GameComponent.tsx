import React, { useEffect, useRef } from "react";
import  './game.css';
import * as PIXI from 'pixi.js'
import 'pixi.js-legacy';
import { Game } from "./game";

const GameComponent = () => {
    const gameWrapRef = useRef<null | HTMLDivElement>(null);
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    useEffect(() => {
        const container = gameWrapRef.current!;
        console.log('pixi game component')
        const application = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: '#fff',
            forceCanvas: true, // 在高版本的 pixi.js 中使用 forceCanvas 需要引入 pixi.js-legacy
            // NOTE 建议传入 canvas 实例 避免在 react 更新的时候重复创建
            view: canvasRef.current as  HTMLCanvasElement,
        })
        gameWrapRef.current!.appendChild(application.view as any);
        const game = new Game(application);
        game.start();
        return () => {
            application.destroy();
        }
    }, [])
    return <div ref={gameWrapRef} className='_game_wrap'>
        <canvas ref={canvasRef} />
    </div>
}
export default React.memo(GameComponent);