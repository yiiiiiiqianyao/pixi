import React, { useEffect, useRef } from "react";
import '../game/gameComponent.css';
import 'pixi.js-legacy';
import { Game } from "../demos/tilemap/game";

const TileMapPage = () => {
    const gameWrapRef = useRef<null | HTMLDivElement>(null);
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    useEffect(() => {
        const container = gameWrapRef.current!;        
        const canvas = canvasRef.current as  HTMLCanvasElement;
        const game = new Game(canvas, container.clientWidth, container.clientHeight);
        game.start();
        return () => {
            // 在 demo 中延迟一帧销毁，避免热更新报错
            requestAnimationFrame(() => {
                game.destroy();
            })
        }
    }, [])
    return <div ref={gameWrapRef} className='_game_wrap'>
        <canvas ref={canvasRef} />
    </div>
}
export default React.memo(TileMapPage);