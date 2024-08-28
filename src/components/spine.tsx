import React, { useEffect, useRef } from "react";
import '../game/gameComponent.css';
import 'pixi.js-legacy';
import { Game } from "../demos/spine/game";

const SpinePage = () => {
    const gameWrapRef = useRef<null | HTMLDivElement>(null);
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    useEffect(() => {
        const container = gameWrapRef.current!;        
        const canvas = canvasRef.current as  HTMLCanvasElement;
        const game = new Game(canvas, container.clientWidth, container.clientHeight);
        game.start();
        return () => {
            game.destroy();
        }
    }, [])
    return <div ref={gameWrapRef} className='_game_wrap'>
        <canvas ref={canvasRef} />
    </div>
}
export default React.memo(SpinePage);