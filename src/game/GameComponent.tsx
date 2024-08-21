import React, { useEffect, useRef } from "react";
import  './game.css';
import * as PIXI from 'pixi.js'
import 'pixi.js-legacy';
import { Game } from "./game";

const GameComponent = () => {
    const gameWrapRef = useRef<null | HTMLDivElement>(null);
    useEffect(() => {
        const container = gameWrapRef.current!;
        console.log('pixi game component')
        const application = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: '#fff',
            forceCanvas: true, // 在高版本的 pixi.js 中使用 forceCanvas 需要引入 pixi.js-legacy
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